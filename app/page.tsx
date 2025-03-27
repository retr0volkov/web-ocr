"use client";

import { useState } from "react";
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

  const handleOCR = async () => {
    if (!imageSrc) return;
    setLoading(true);
    setText("");

    try {
      const { data } = await Tesseract.recognize(imageSrc, "eng+rus", {
        logger: (m) => console.log(m),
      });
      setText(data.text);
      setDialogOpen(true);
    } catch (error) {
      console.error("Ошибка распознавания:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      <h1 className="text-xl font-bold">Распознавание текста</h1>

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
            <pre className="whitespace-pre-wrap">{text}</pre>
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
