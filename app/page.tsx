"use client";

import { useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clipboard, Loader2, Upload } from "lucide-react";

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { mode: "no-cors" });
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Не удалось загрузить изображение:", error);
      alert("Ошибка загрузки изображения. Попробуйте загрузить файлом.");
    }
  };

  const preprocessImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Prevents CORS issues
      img.src = imageSrc;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3; // Grayscale
          data[i] = avg; // R
          data[i + 1] = avg; // G
          data[i + 2] = avg; // B
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL()); // Return processed image
      };
    });
  };

  const handleOCR = async () => {
    if (!imageSrc) return;
    setLoading(true);
    setText("");

    try {
      const processedImage = await preprocessImage(imageSrc);
      const { data } = await Tesseract.recognize(processedImage, "eng+rus", {
        logger: (m) => console.log(m),
      });

      setText(data.text);
      setDialogOpen(true);
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to process the image.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image")) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => setImageSrc(reader.result as string);
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      <h1 className="text-xl font-bold">Распознавание текста</h1>
      <p className="max-w-80 text-center">Вставьте изображение из буфера обмена или загрузите его</p>

      <Input
        className="w-80"
        type="text"
        placeholder="Введите ссылку на изображение"
        onChange={(e) => handleImageUrl(e.target.value)}
      />

      <div className="flex justify-between w-80">
        <Input className="w-70" type="file" accept="image/*" onChange={handleImageUpload} />
        <Upload className="w-5 h-5 m-2" />
      </div>

      {imageSrc && (
        <img src={imageSrc} alt="Selected" className="max-w-xs rounded-md shadow-md" />
      )}

      <Button onClick={handleOCR} disabled={loading}>
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Извлечь текст"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Извлеченный текст</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-neutral-800 rounded-md">
            <pre className="whitespace-pre-wrap text-neutral-50 max-h-96 overflow-scroll">{text}</pre>
          </div>
          <Button onClick={copyToClipboard} className="flex justify-between mx-auto mt-4">
            <Clipboard className="w-4 h-4 mr-2 my-auto" />
            <p>
              Копировать в буфер обмена
            </p>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
