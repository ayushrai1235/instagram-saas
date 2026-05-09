"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
}

export function MediaUploader({ mediaUrls, onChange }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Get auth params
      const authRes = await fetch("/api/imagekit/auth");
      if (!authRes.ok) throw new Error("Failed to get auth params");
      const { signature, expire, token } = await authRes.json();

      // 2. Upload to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);
      formData.append("fileName", file.name);

      const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      
      const uploadData = await uploadRes.json();
      
      // 3. Update state
      onChange([...mediaUrls, uploadData.url]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeMedia = (index: number) => {
    const newUrls = [...mediaUrls];
    newUrls.splice(index, 1);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 transition-colors bg-white/[0.02]"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <p className="text-sm font-medium text-white mb-1">
          {isUploading ? "Uploading..." : "Click to upload media"}
        </p>
        <p className="text-xs text-gray-500">
          JPG, PNG, GIF, MP4 (max 10MB)
        </p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/*"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </div>

      {/* Previews */}
      {mediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {mediaUrls.map((url, i) => (
            <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-white/10 bg-black/50">
              {url.match(/\.(mp4|webm)$/i) ? (
                <video src={url} className="w-full h-full object-cover" />
              ) : (
                <img src={url} alt="Media preview" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMedia(i);
                  }}
                  className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
