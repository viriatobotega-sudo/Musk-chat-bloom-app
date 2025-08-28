"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Phone, Video, MoreVertical } from "lucide-react"
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"
import { TypingIndicator } from "./typing-indicator"
import { useChat } from "@/hooks/use-chat"
import type { UserChat } from "@/types/chat"

interface ChatWindowProps {
  chatId: string
  otherUser: UserChat
  onBack: () => void
}

export function ChatWindow({ chatId, otherUser, onBack }: ChatWindowProps) {
  const { messages, loading, typingUsers, sendMessage, setTyping } = useChat(chatId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typingUsers])

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "visto agora mesmo"
    if (minutes < 60) return `visto ${minutes}m atrás`
    if (hours < 24) return `visto ${hours}h atrás`
    return `visto ${days}d atrás`
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="ghost" onClick={onBack} className="md:hidden">
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.photoURL || "/placeholder.svg"} />
              <AvatarFallback>
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            {otherUser.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{otherUser.displayName}</h3>
            <p className="text-sm text-muted-foreground">
              {otherUser.isOnline ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Online
                </Badge>
              ) : (
                formatLastSeen(otherUser.lastSeen)
              )}
            </p>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" variant="ghost">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Video className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Comece uma conversa</h3>
            <p>Envie uma mensagem para {otherUser.displayName}</p>
          </div>
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}

        <TypingIndicator typingUsers={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={sendMessage} onTyping={setTyping} />
    </div>
  )
}
