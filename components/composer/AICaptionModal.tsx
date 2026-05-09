"use client";

import { useState } from "react";
import { generateCaption, generateHashtags } from "@/app/actions/ai";
import { X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AICaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string, isAppend: boolean) => void;
  platform: string;
}

export function AICaptionModal({ isOpen, onClose, onInsert, platform }: AICaptionModalProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateCaption = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const result = await generateCaption(topic, tone, platform);
      onInsert(result, false); // false = replace content
      onClose();
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Failed to generate caption.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!topic) return;
    setIsGenerating(true);
    try {
      const result = await generateHashtags(topic, platform);
      onInsert(`\n\n${result}`, true); // true = append content
      onClose();
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Failed to generate hashtags.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Topic / Instructions</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What is this post about?"
              className="w-full h-24 bg-black border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="funny">Funny & Humorous</option>
              <option value="informative">Informative & Educational</option>
              <option value="promotional">Promotional / Sales</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 flex gap-3 bg-black/20">
          <button
            onClick={handleGenerateCaption}
            disabled={isGenerating || !topic}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Caption
          </button>
          <button
            onClick={handleGenerateHashtags}
            disabled={isGenerating || !topic}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : "#"}
            Add Hashtags
          </button>
        </div>
      </div>
    </div>
  );
}
