"use client";
import React, { useState, useEffect, useRef } from "react";
import { CldImage } from "next-cloudinary";

const socialFormats = {
  "Instagram Square (1:1)": {
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
  },
  "Instagram Portrait (4:5)": {
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
  },
  "Twitter Post (16:9)": {
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
  },
  "Twitter Header (3:1)": {
    width: 1500,
    height: 500,
    aspectRatio: "3:1",
  },
  "Facebook Cover (205:78)": {
    width: 820,
    height: 312,
    aspectRatio: "205:78",
  },
};

type SocialFormat = keyof typeof socialFormats;

export default function SocialShare() {
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [selectedFormat, setSelectedFormat] =
    useState<SocialFormat>("Instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (uploadImage) {
      setIsTransforming(true);
    }
  }, [selectedFormat, uploadImage]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const data = await response.json();
      console.log("UPLOAD RESPONSE:", data);

      // IMPORTANT: your API must return { publicId: "..." }
      setUploadImage(data.publicId);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!imageRef.current) return;

    fetch(imageRef.current.src)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedFormat
          .replace(/\s+/g, "_")
          .toLowerCase()}.png`;

        link.click();
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-3xl px-6">
        <h1 className="text-3xl font-semibold text-center mb-10">
          Social Media Image Creator
        </h1>

        <div className="bg-[#0f0f0f] rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-6">Upload an Image</h2>

          {/* File Input */}
          <div className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-700 rounded-lg p-2">
            <label className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer text-sm font-medium">
              CHOOSE FILE
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-gray-400 text-sm">{fileName}</span>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <progress className="progress progress-primary w-full"></progress>
            </div>
          )}

          {/* Main UI after upload */}
          {uploadImage && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">
                Select Social Media Format
              </h2>

              <select
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg p-2"
                value={selectedFormat}
                onChange={(e) =>
                  setSelectedFormat(e.target.value as SocialFormat)
                }
              >
                {Object.keys(socialFormats).map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>

              {/* Preview */}
              <div className="mt-8 relative">
                <h3 className="text-md font-semibold mb-3">Preview:</h3>

                <div className="flex justify-center">
                  {isTransforming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 rounded-lg">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  )}

                  <CldImage
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    src={uploadImage}
                    sizes="100vw"
                    alt="transformed image"
                    crop="fill"
                    aspectRatio={socialFormats[selectedFormat].aspectRatio}
                    gravity="auto"
                    ref={imageRef}
                    onLoad={() => setIsTransforming(false)}
                    className="rounded-lg border border-gray-700"
                  />
                </div>
              </div>

              {/* Download */}
              <div className="flex justify-end mt-6">
                <button
                  className="bg-indigo-500 hover:bg-indigo-600 px-5 py-2 rounded-md font-medium disabled:opacity-50"
                  onClick={handleDownload}
                  disabled={isTransforming}
                >
                  Download for {selectedFormat}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}