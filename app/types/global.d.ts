// types/global.d.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    heic2any: (options: {
      blob: File | Blob;
      toType: string;
      quality?: number;
    }) => Promise<Blob | Blob[]>;
  }
}

export {};