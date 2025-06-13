import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// レート制限用のメモリストア（本番環境ではRedisなどを使用）
const rateLimitStore = new Map();

// IP別の使用状況を管理
interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// レート制限チェック
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1時間
  const maxRequests = 10; // 1時間に10回まで

  const key = `rate_limit:${ip}`;
  const current = rateLimitStore.get(key) as RateLimitInfo;

  if (!current || now > current.resetTime) {
    // 新しいウィンドウの開始
    const newInfo: RateLimitInfo = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(key, newInfo);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newInfo.resetTime
    };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime
    };
  }

  current.count++;
  rateLimitStore.set(key, current);
  
  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime
  };
}

// 日次制限チェック
function checkDailyLimit(): { allowed: boolean; used: number; limit: number } {
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `daily_usage:${today}`;
  const dailyLimit = 1000; // 1日1000回まで
  
  const currentUsage = rateLimitStore.get(dailyKey) || 0;
  
  if (currentUsage >= dailyLimit) {
    return { allowed: false, used: currentUsage, limit: dailyLimit };
  }
  
  rateLimitStore.set(dailyKey, currentUsage + 1);
  return { allowed: true, used: currentUsage + 1, limit: dailyLimit };
}

// レア度に応じたプロンプト調整
const rarityPrompts = {
  common: "身近で日常的に使われているアイテムとして",
  uncommon: "やや珍しい性質や用途を持つアイテムとして",
  rare: "特別な価値や機能を持つ貴重なアイテムとして", 
  epic: "卓越した力や特殊な能力を秘めたアイテムとして",
  legendary: "伝説的な性能や歴史を持つ究極のアイテムとして",
  mythic: "神話級の力を宿す至高のアイテムとして"
};

// 伝承のバリエーション
const loreStyles = [
  "現代の技術革新により生まれた",
  "職人の匠の技によって生み出された",
  "日常生活の中で重要な役割を果たす",
  "多くの人々に愛され続けている",
  "時代を超えて愛用されている",
  "革新的な発想から誕生した",
  "実用性と美しさを兼ね備えた",
  "人類の知恵と技術の結晶である",
  "生活を豊かにする力を持つ",
  "使う人の心を満たす",
  "古くから伝わる製法で作られた",
  "現代生活に欠かせない存在となった"
];

export async function POST(request: NextRequest) {
  try {
    // IPアドレス取得
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // レート制限チェック
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime);
      return NextResponse.json({
        error: 'レート制限に達しました',
        message: `1時間に10回まで利用可能です。${resetDate.toLocaleTimeString('ja-JP')}以降に再度お試しください。`,
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString()
        }
      });
    }

    // 日次制限チェック
    const dailyLimit = checkDailyLimit();
    if (!dailyLimit.allowed) {
      return NextResponse.json({
        error: '日次制限に達しました',
        message: '1日の利用上限に達しました。明日再度お試しください。',
        dailyUsage: dailyLimit.used,
        dailyLimit: dailyLimit.limit
      }, { status: 429 });
    }

    // リクエストボディをパース
    const body = await request.json();
    const { image, rarity } = body;

    if (!image || !rarity) {
      return NextResponse.json({ error: 'Image and rarity are required' }, { status: 400 });
    }

    // 環境変数チェック
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Gemini APIの初期化
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ランダムな伝承スタイルを選択
    const randomLoreStyle = loreStyles[Math.floor(Math.random() * loreStyles.length)];

    // プロンプトの構築
    const rarityPrompt = rarityPrompts[rarity as keyof typeof rarityPrompts] || rarityPrompts.common;
    const prompt = `
この画像のアイテムを${rarityPrompt}、神秘的で幻想的な世界観で分析してください。

以下のJSON形式で回答してください：
{
  "name": "アイテム名（日本語、神秘的で興味深い名前）",
  "description": "アイテムの詳細説明（150-200文字、神秘的で幻想的な雰囲気のある文章）",
  "effect": "特殊効果や能力（50-100文字、${rarity}レア度に相応しい効果）",
  "lore": "アイテムの背景や物語（100-150文字、神秘的で詩的な表現）"
}

重要な指示：
- lore（伝承）部分は「${randomLoreStyle}」という表現を含めて、現代的な視点も取り入れてください
- 必ずしも古代の遺物である必要はありません
- 現代のアイテムでも、それが持つ特別な意味や価値を神秘的に表現してください
- 「遥か昔」「混沌の時代」などの古代表現に偏らず、多様な背景設定を使ってください

レア度「${rarity}」に相応しい内容にしてください：
- common: 身近で親しみやすい効果
- uncommon: やや特殊な効果
- rare: 注目すべき特別な能力
- epic: 強力で印象的な効果
- legendary: 伝説級の圧倒的な力
- mythic: 神話級の究極の能力

必ずJSONフォーマットのみで回答し、余計な説明は含めないでください。
`;

    // 画像データの準備
    const imageData = {
      inlineData: {
        data: image,
        mimeType: "image/jpeg",
      },
    };

    // APIリクエスト実行
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();

    // JSONパース
    let parsedResult;
    try {
      // レスポンステキストからJSONを抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON format not found in response');
      }
    } catch (parseError) {
      // フォールバック: レア度に応じた多様な背景設定
      const fallbackLores = {
        mythic: "宇宙の法則を司る究極の力を宿し、存在するだけで周囲の現実を変化させる奇跡のアイテム。",
        legendary: "世界中の専門家が認める最高級の品質を誇り、所有者に絶大な信頼と威厳をもたらす逸品。",
        epic: "革新的な技術と伝統的な技法が融合して生まれた、時代を超越する傑作。",
        rare: "熟練した職人の手によって丹精込めて作られた、特別な価値を持つ貴重品。",
        uncommon: "こだわりの素材と独特な製法で作られた、知る人ぞ知る隠れた名品。",
        common: "日常生活に欠かせない存在として多くの人に愛され、生活を支える頼もしいパートナー。"
      };

      const effectByRarity = {
        mythic: "現実を意のままに操る究極の力",
        legendary: "伝説級の圧倒的な特殊能力",
        epic: "強力な魔法効果を発動",
        rare: "特別な能力を秘めている",
        uncommon: "軽微な特殊効果を持つ",
        common: "日常を豊かにする基本効果"
      };

      parsedResult = {
        name: "神秘のアイテム",
        description: "見た目は普通でも、その内側には計り知れない力が宿っている。使用者の心の在り方によって真価を発揮する、不思議な魅力を持つアイテム。",
        effect: effectByRarity[rarity as keyof typeof effectByRarity] || effectByRarity.common,
        lore: fallbackLores[rarity as keyof typeof fallbackLores] || fallbackLores.common
      };
    }
    
    // レスポンス返却（制限情報も含める）
    return NextResponse.json(parsedResult, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        'X-Daily-Usage': dailyLimit.used.toString(),
        'X-Daily-Limit': dailyLimit.limit.toString()
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to analyze item',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}