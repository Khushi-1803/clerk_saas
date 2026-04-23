

"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useUser } from "@clerk/nextjs";
import "react-toastify/dist/ReactToastify.css";

const VideoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress;

  const MAX_FILE_SIZE = 70 * 1024 * 1024;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a video file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size too large (Max: 70MB)");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file.size.toString());

    try {
      await axios.post("/api/video-upload", formData);

      toast.success("Video uploaded successfully 🎉");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed ❌");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center py-10 px-4">
      <ToastContainer />

      {/* USER EMAIL DISPLAY */}
      <p className="text-gray-300 mb-4">
        Logged in as: <span className="text-white">{email}</span>
      </p>

      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Upload Video
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
              required
            />
          </div>

          {/* File */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-900 border border-slate-700 text-white"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              {isUploading ? "Uploading..." : "Upload Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;