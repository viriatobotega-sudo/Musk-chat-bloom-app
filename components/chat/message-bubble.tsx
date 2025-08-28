"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Download, Play, Pause } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { ChatMessage } from "@/types/chat"

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAuth()
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const isOwnMessage = message.senderId === user?.uid

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFileSize = (url: string) => {
    // This is a placeholder - in a real app you'd store file size in the message
    return "Arquivo"
  }

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAudioPlay = (url: string) => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause()
        setIsPlaying(false)
      } else {
        audioElement.play()
        setIsPlaying(true)
      }
    } else {
      const audio = new Audio(url)
      setAudioElement(audio)

      audio.onended = () => {
        setIsPlaying(false)
      }

      audio.play()
      setIsPlaying(true)
    }
  }

  return (
    <div className={`flex items-end space-x-2 mb-4 ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""}`}>
      {!isOwnMessage && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.senderPhoto || "/placeholder.svg"} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? "ml-auto" : ""}`}>
        {!isOwnMessage && <p className="text-xs text-muted-foreground mb-1 px-3">{message.senderName}</p>}

        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
          }`}
        >
          {message.type === "text" && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}

          {message.type === "image" && (
            <div className="space-y-2">
              <div className="relative">
                <img
                  src={message.fileUrl || "/placeholder.svg"}
                  alt="Imagem enviada"
                  className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ maxHeight: "200px", maxWidth: "250px" }}
                  onClick={() => window.open(message.fileUrl, "_blank")}
                />
              </div>
              {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
            </div>
          )}

          {message.type === "document" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-background/10 rounded min-w-[200px]">
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.fileName}</p>
                  <p className="text-xs opacity-75">{formatFileSize(message.fileUrl || "")}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-background/20"
                  onClick={() => handleDownload(message.fileUrl || "", message.fileName || "document")}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
            </div>
          )}

          {message.type === "audio" && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-background/10 rounded min-w-[200px]">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-background/20"
                  onClick={() => handleAudioPlay(message.fileUrl || "")}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mensagem de áudio</p>
                  <p className="text-xs opacity-75">{isPlaying ? "Reproduzindo..." : "Toque para ouvir"}</p>
                </div>
                <div className="w-16 h-2 bg-background/20 rounded-full">
                  <div className="h-full bg-current rounded-full" style={{ width: "0%" }} />
                </div>
              </div>
              {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
            </div>
          )}
        </div>

        <p className={`text-xs text-muted-foreground mt-1 px-3 ${isOwnMessage ? "text-right" : ""}`}>
          {formatTime(message.timestamp)}
          {message.edited && " (editado)"}
        </p>
      </div>
    </div>
  )
}
