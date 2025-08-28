"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Send, FileText, Music } from "lucide-react"

interface MediaPreviewProps {
  file: File
  type: "image" | "document" | "audio"
  onSend: (file: File, caption?: string) => void
  onCancel: () => void
  isUploading?: boolean
  uploadProgress?: number
}

export function MediaPreview({ file, type, onSend, onCancel, isUploading, uploadProgress }: MediaPreviewProps) {
  const [caption, setCaption] = useState("")

  const handleSend = () => {
    onSend(file, caption)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* File Preview */}
          <div className="relative">
            {type === "image" && (
              <div className="relative">
                <img
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={onCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {type === "document" && (
              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={onCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {type === "audio" && (
              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <Music className="w-8 h-8 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Gravação de áudio</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={onCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <Input
            placeholder="Adicione uma legenda..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isUploading}
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enviando...</span>
                <span>{Math.round(uploadProgress || 0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress || 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel} disabled={isUploading} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={isUploading} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
