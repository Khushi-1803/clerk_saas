export interface Video {
  id: string;
  title: string;
  description: string;
  publicId: string;
  originalSize: string;
  compressedSize: string;
  createdAt: string;   // ✅ FIXED
  updatedAt: string;   // ✅ FIXED
  duration: number;
}