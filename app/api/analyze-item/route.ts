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

// 背景設定のバリエーション
const backgroundStyles = [
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
  "現代生活に欠かせない存在となった",
  "伝統と革新が融合して生まれた",
  "特別な想いが込められた",
  "匠の技と情熱が結実した"
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

    // ランダムな背景スタイルを選択
    const randomBackgroundStyle = backgroundStyles[Math.floor(Math.random() * backgroundStyles.length)];

    // プロンプトの構築（descriptionとloreを統合）
    const rarityPrompt = rarityPrompts[rarity as keyof typeof rarityPrompts] || rarityPrompts.common;
    const prompt = `
この画像のアイテムを${rarityPrompt}、神秘的で幻想的な世界観で分析してください。

以下のJSON形式で回答してください：
{
  "name": "アイテム名（日本語、神秘的で興味深い名前）",
  "description": "アイテムの詳細説明と背景を統合した内容（120-150文字、ダークソウルらしい硬質で神秘的な文体、である調で格調高く）",
  "effect": "特殊効果や能力（50-100文字、${rarity}レア度に相応しい効果、ダークソウル風の硬質な文体で）"
}

重要な指示：
- description部分は、アイテムの外見・特徴と背景を簡潔に組み合わせてください
- ダークソウルらしい硬質で神秘的な文体で記述してください（である調、断定的、格調高い表現）
- 「です・ます調」は一切使わず、「〜である」「〜なり」「〜という」などの古風な語尾を使用
- 背景の表現として「${randomBackgroundStyle}」という要素を含めて、現代的な視点も取り入れてください
- 必ずしも古代の遺物である必要はありません
- 現代のアイテムでも、それが持つ特別な意味や価値を神秘的に表現してください
- 「遥か昔」「混沌の時代」などの古代表現に偏らず、多様な背景設定を使ってください
- descriptionは150文字以内で読みやすく、簡潔にまとめてください
- 曰くありげで物語性のある表現を心がけてください

レア度「${rarity}」に相応しい内容にしてください：
- common: 身近で親しみやすい効果と説明
- uncommon: やや特殊な効果と興味深い背景
- rare: 注目すべき特別な能力と価値ある歴史
- epic: 強力で印象的な効果と卓越した背景
- legendary: 伝説級の圧倒的な力と壮大な物語
- mythic: 神話級の究極の能力と超越的な起源

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
      // フォールバック: レア度に応じたダークソウル風の説明
      const fallbackDescriptions = {
        mythic: "宇宙の法則を司る究極の力を宿し、存在するだけで周囲の現実を変化させる奇跡の遺物である。その起源は時空を超越した次元にあり、選ばれし者のみが真の力を解放しうるという。",
        legendary: "世界中の専門家が認める最高級の品質を誇り、所有者に絶大な信頼と威厳をもたらす逸品なり。長き歴史の中で数々の偉大なる人物たちに愛用され、その功績と共に語り継がれている。",
        epic: "革新的な技術と伝統的な技法が融合して生まれし、時代を超越する傑作である。熟練せし職人たちの情熱と技術の粋を集めて作られ、使用者に特別なる体験をもたらすという。",
        rare: "熟練せし職人の手によって丹精込めて作られし、特別な価値を持つ貴重品である。厳選されし素材と伝統的な製法により生み出され、所有者に誇りと満足をもたらすという。",
        uncommon: "こだわりの素材と独特な製法で作られし、知る人ぞ知る隠れたる名品である。一般的なものとは一線を画す特別な魅力を持ち、使用者に新たなる発見と喜びをもたらすという。",
        common: "日常に欠かせぬ存在として多くの人に愛され、生活を支える頼もしき相棒である。シンプルでありながら使いやすく設計され、毎日の暮らしに安心と便利さをもたらすという。"
      };

      const effectByRarity = {
        mythic: "現実を意のままに操る究極の力を発動せしむ",
        legendary: "伝説級の圧倒的なる特殊能力を解放する",
        epic: "強力なる魔法効果を継続的に発動せしむ", 
        rare: "特別なる能力を安定して発揮するという",
        uncommon: "軽微なる特殊効果を定期的に発動する",
        common: "日常を豊かにする基本効果をもたらすという"
      };

      parsedResult = {
        name: "神秘なる遺物",
        description: fallbackDescriptions[rarity as keyof typeof fallbackDescriptions] || fallbackDescriptions.common,
        effect: effectByRarity[rarity as keyof typeof effectByRarity] || effectByRarity.common
      };
    }

    // レスポンスの検証（loreフィールドがある場合は削除）
    if (parsedResult.lore) {
      // loreがある場合はdescriptionと統合
      parsedResult.description = `${parsedResult.description} ${parsedResult.lore}`;
      delete parsedResult.lore;
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