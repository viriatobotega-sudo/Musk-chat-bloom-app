"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Send, Paperclip, Mic, ImageIcon, FileText, X } from "lucide-react"
import { MediaPreview } from "./media-preview"
import { useMediaUpload } from "@/hooks/use-media-upload"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"

interface MessageInputProps {
  onSendMessage: (
    content: string,
    type?: "text" | "image" | "document" | "audio",
    fileUrl?: string,
    fileName?: string,
  ) => void
  onTyping: (isTyping: boolean) => void
  disabled?: boolean
}

export function MessageInput({ onSendMessage, onTyping, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<"image" | "document" | "audio" | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const { uploadFile, uploadProgress, resetProgress } = useMediaUpload()
  const { isRecording, audioBlob, recordingTime, startRecording, stopRecording, cancelRecording, setAudioBlob } =
    useAudioRecorder()

  const handleSend = () => {
    if (!message.trim() || disabled) return

    onSendMessage(message)
    setMessage("")
    onTyping(false)

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Handle typing indicator
    onTyping(true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 1000)
  }

  const handleFileSelect = (type: "image" | "document") => {
    const input = document.createElement("input")
    input.type = "file"

    if (type === "image") {
      input.accept = "image/*"
    } else {
      input.accept = ".pdf,.doc,.docx,.txt,.zip,.rar"
    }

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setSelectedFile(file)
        setFileType(type)
      }
    }

    input.click()
  }

  const handleMediaSend = async (file: File, caption?: string) => {
    if (!fileType) return

    try {
      const fileUrl = await uploadFile(file, fileType)
      onSendMessage(caption || "", fileType, fileUrl, file.name)

      // Reset states
      setSelectedFile(null)
      setFileType(null)
      resetProgress()
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  const handleAudioSend = async () => {
    if (!audioBlob) return

    try {
      const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, {
        type: "audio/webm",
      })

      const fileUrl = await uploadFile(audioFile, "audio")
      onSendMessage("", "audio", fileUrl, audioFile.name)

      // Reset audio states
      setAudioBlob(null)
      resetProgress()
    } catch (error) {
      console.error("Error uploading audio:", error)
    }
  }

  const cancelMedia = () => {
    setSelectedFile(null)
    setFileType(null)
    resetProgress()
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Show media preview if file is selected
  if (selectedFile && fileType) {
    return (
      <div className="border-t bg-background p-4">
        <MediaPreview
          file={selectedFile}
          type={fileType}
          onSend={handleMediaSend}
          onCancel={cancelMedia}
          isUploading={uploadProgress.isUploading}
          uploadProgress={uploadProgress.progress}
        />
      </div>
    )
  }

  // Show audio recording interface
  if (audioBlob) {
    return (
      <div className="border-t bg-background p-4">
        <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Gravação de áudio</p>
            <p className="text-xs text-muted-foreground">Pronto para enviar</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setAudioBlob(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {uploadProgress.isUploading && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Enviando áudio...</span>
              <span>{Math.round(uploadProgress.progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex space-x-2 mt-3">
          <Button
            variant="outline"
            onClick={() => setAudioBlob(null)}
            disabled={uploadProgress.isUploading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button onClick={handleAudioSend} disabled={uploadProgress.isUploading} className="flex-1">
            <Send className="w-4 h-4 mr-2" />
            Enviar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" disabled={disabled}>
              <Paperclip className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleFileSelect("image")}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Imagem
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFileSelect("document")}>
              <FileText className="w-4 h-4 mr-2" />
              Documento
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            rows={1}
            className="min-h-[40px] max-h-32 resize-none"
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={cancelRecording}
          disabled={disabled}
          className={isRecording ? "bg-red-500 text-white" : ""}
        >
          <Mic className="w-4 h-4" />
        </Button>

        <Button onClick={handleSend} disabled={!message.trim() || disabled} size="sm">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {isRecording && (
        <div className="mt-2 text-center">
          <p className="text-sm text-red-500 animate-pulse">Gravando áudio... {recordingTime} - Solte para parar</p>
        </div>
      )}
    </div>
  )
}
