"use client";

import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft, HiOutlinePhoto, HiOutlineXMark, HiOutlineArrowsPointingOut } from "react-icons/hi2";
import { FORUM_CATEGORIES } from "@/lib/constants";
import { useAuth } from "@/components/providers";
import { usePosts } from "@/components/providers";
import { useToast } from "@/components/ui";
import clsx from "clsx";

interface ImagePreview {
  id: string;
  file: File;
  url: string;
  name: string;
  size: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function NewPostPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { addPost } = usePosts();
  const { addToast } = useToast();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [tagsInput, setTagsInput] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const MAX_FILES = 10;
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/tiff", "image/webp"];

  const processFiles = useCallback((files: FileList | File[]) => {
    setUploadError("");
    const fileArray = Array.from(files);

    // Walidacja ilości
    if (images.length + fileArray.length > MAX_FILES) {
      setUploadError(`Maksymalnie ${MAX_FILES} zdjęć. Masz już ${images.length}.`);
      return;
    }

    const newImages: ImagePreview[] = [];
    for (const file of fileArray) {
      // Walidacja typu
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`Nieobsługiwany format: ${file.name}. Dozwolone: PNG, JPG, TIFF, WebP.`);
        continue;
      }
      // Walidacja rozmiaru
      if (file.size > MAX_SIZE) {
        setUploadError(`Plik ${file.name} jest za duży (${formatFileSize(file.size)}). Max: 50MB.`);
        continue;
      }
      // Sprawdź duplikaty
      const isDuplicate = images.some(
        (img) => img.name === file.name && img.size === formatFileSize(file.size)
      );
      if (isDuplicate) continue;

      newImages.push({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: formatFileSize(file.size),
      });
    }

    setImages((prev) => [...prev, ...newImages]);
  }, [images]);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
    setUploadError("");
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Sprawdź czy naprawdę opuściliśmy strefę drop
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input, żeby ten sam plik można było wybrać ponownie
    e.target.value = "";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-night-800 rounded w-48 mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-night-800 rounded w-full" />
            <div className="h-32 bg-night-800 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Niezalogowany — redirect
  if (!isAuthenticated || !user) {
    router.push("/login?redirect=/forum/new");
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      {/* Powrót */}
      <Link
        href="/forum"
        className="inline-flex items-center gap-2 text-sm text-night-400 hover:text-night-200 transition-colors mb-6"
      >
        <HiOutlineArrowLeft className="h-4 w-4" />
        Wróć do forum
      </Link>

      <h1 className="font-display text-3xl font-bold text-night-100 mb-8">
        Nowy post
      </h1>

      <div className="glass-card p-6 md:p-8 space-y-6">
        {/* Tytuł */}
        <div>
          <label className="block text-sm font-medium text-night-300 mb-2">
            Tytuł
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O czym chcesz napisać?"
            className="input-field text-lg"
          />
        </div>

        {/* Kategoria */}
        <div>
          <label className="block text-sm font-medium text-night-300 mb-2">
            Kategoria
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FORUM_CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
                  category === cat.value
                    ? "bg-cosmos-500/20 border-cosmos-500/50 text-cosmos-300"
                    : "bg-night-800 border-night-700 text-night-400 hover:border-night-600"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Treść */}
        <div>
          <label className="block text-sm font-medium text-night-300 mb-2">
            Treść
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Napisz treść posta..."
            className="input-field min-h-[200px] resize-y"
          />
        </div>

        {/* Tagi */}
        <div>
          <label className="block text-sm font-medium text-night-300 mb-2">
            Tagi (oddziel przecinkiem, np. #deepsky, #mgławica)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="#deepsky, #mgławica, #początkujący"
            className="input-field"
          />
        </div>

        {/* Zdjęcia */}
        <div>
          <label className="block text-sm font-medium text-night-300 mb-2">
            Zdjęcia {images.length > 0 && <span className="text-night-500">({images.length}/{MAX_FILES})</span>}
          </label>

          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={clsx(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
              isDragging
                ? "border-cosmos-400 bg-cosmos-500/10 scale-[1.01]"
                : "border-night-700 hover:border-cosmos-500/50 hover:bg-night-800/30",
              images.length >= MAX_FILES && "opacity-50 pointer-events-none"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/tiff,image/webp"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className={clsx(
              "transition-transform duration-200",
              isDragging && "scale-110"
            )}>
              <HiOutlinePhoto className={clsx(
                "h-10 w-10 mx-auto mb-3 transition-colors",
                isDragging ? "text-cosmos-400" : "text-night-500"
              )} />
              <p className={clsx(
                "text-sm font-medium mb-1",
                isDragging ? "text-cosmos-300" : "text-night-300"
              )}>
                {isDragging ? "Upuść zdjęcia tutaj" : "Kliknij lub przeciągnij pliki tutaj"}
              </p>
              <p className="text-xs text-night-600">
                PNG, JPG, TIFF, WebP do 50MB • max {MAX_FILES} zdjęć
              </p>
            </div>
          </div>

          {/* Błąd uploadu */}
          {uploadError && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <span>⚠️</span>
              <span>{uploadError}</span>
              <button
                onClick={() => setUploadError("")}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <HiOutlineXMark className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Podgląd miniatur */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-night-700 bg-night-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {/* Overlay z akcjami */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxImage(img.url);
                      }}
                      className="p-2 rounded-full bg-night-900/80 text-night-200 hover:bg-night-900 hover:text-white transition-colors"
                      title="Powiększ"
                    >
                      <HiOutlineArrowsPointingOut className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(img.id);
                      }}
                      className="p-2 rounded-full bg-red-900/80 text-red-300 hover:bg-red-800 hover:text-red-200 transition-colors"
                      title="Usuń"
                    >
                      <HiOutlineXMark className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Nazwa i rozmiar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                    <p className="text-[10px] text-night-300 truncate">{img.name}</p>
                    <p className="text-[9px] text-night-500">{img.size}</p>
                  </div>
                </div>
              ))}

              {/* Przycisk dodaj więcej */}
              {images.length < MAX_FILES && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-night-700 hover:border-cosmos-500/50 flex flex-col items-center justify-center gap-1 text-night-500 hover:text-cosmos-400 transition-colors"
                >
                  <HiOutlinePhoto className="h-6 w-6" />
                  <span className="text-xs">Dodaj więcej</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Lightbox */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-night-800/80 text-night-300 hover:text-white hover:bg-night-700 transition-colors z-10"
            >
              <HiOutlineXMark className="h-6 w-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage}
              alt="Podgląd"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Przyciski */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-night-700">
          <Link href="/forum" className="btn-ghost">
            Anuluj
          </Link>
          <button
            type="button"
            onClick={() => {
              if (!title.trim() || !content.trim()) {
                addToast({
                  type: "error",
                  title: "Brakujące pola",
                  message: "Podaj tytuł i treść posta.",
                  duration: 4000,
                });
                return;
              }

              // Parsowanie tagów
              const parsedTags = tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
                .map((t) => (t.startsWith("#") ? t : `#${t}`));

              // Konwersja blob URL-ów obrazków na data URLs żeby przetrwały w localStorage
              const imageUrls = images.map((img) => img.url);

              addPost({
                title: title.trim(),
                content: content.trim(),
                category: category as import("@/types").PostCategory,
                tags: parsedTags,
                images: imageUrls,
                authorId: user!.id,
                authorName: user!.displayName,
                authorAvatar: user!.avatar,
              });

              addToast({
                type: "success",
                title: "Post opublikowany!",
                message: "Twój post jest teraz widoczny na forum.",
                duration: 4000,
              });
              router.push("/forum");
            }}
            className="btn-primary"
          >
            Opublikuj post
          </button>
        </div>
      </div>
    </div>
  );
}
