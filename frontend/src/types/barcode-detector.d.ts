type BarcodeDetectorFormat =
  | "aztec"
  | "code_128"
  | "code_39"
  | "code_93"
  | "codabar"
  | "data_matrix"
  | "ean_13"
  | "ean_8"
  | "itf"
  | "pdf417"
  | "qr_code"
  | "upc_a"
  | "upc_e";

declare class BarcodeDetector {
  constructor(options?: { formats?: BarcodeDetectorFormat[] });
  detect(
    image: ImageBitmap | HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageData
  ): Promise<Array<{ rawValue: string }>>;
  static getSupportedFormats?: () => Promise<BarcodeDetectorFormat[]>;
}
