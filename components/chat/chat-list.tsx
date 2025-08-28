"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import { useChatRooms } from "@/hooks/use-chat-rooms"
import { useUsers } from "@/hooks/use-users"
import type { ChatRoom } from "@/types/chat"

interface ChatListProps {
  onChatSelect: (chatId: string, otherUserId: string) => void
}

export function ChatList({ onChatSelect }: ChatListProps) {
  const { chatRooms, loading } = useChatRooms()
  const { users } = useUsers()

  const getOtherUser = (chatRoom: ChatRoom) => {
    const otherUserId = chatRoom.participants.find((id) => id !== chatRoom.createdBy)
    return users.find((user) => user.uid === otherUserId)
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "agora"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {chatRooms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhuma conversa</h3>
          <p>Comece uma nova conversa selecionando um usuário</p>
        </div>
      ) : (
        chatRooms.map((chatRoom) => {
          const otherUser = getOtherUser(chatRoom)
          if (!otherUser) return null

          return (
            <Card
              key={chatRoom.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onChatSelect(chatRoom.id, otherUser.uid)}
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={otherUser.photoURL || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {otherUser.displayName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    {otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-medium truncate text-sm">{otherUser.displayName}</h3>
                      {chatRoom.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chatRoom.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>

                    {chatRoom.lastMessage ? (
                      <p className="text-xs text-muted-foreground truncate">
                        {chatRoom.lastMessage.type === "text"
                          ? chatRoom.lastMessage.content
                          : `${chatRoom.lastMessage.type === "image" ? "📷" : chatRoom.lastMessage.type === "audio" ? "🎵" : "📎"} ${chatRoom.lastMessage.type}`}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhuma mensagem ainda</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    {Math.random() > 0.7 && (
                      <Badge
                        variant="destructive"
                        className="text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center"
                      >
                        {Math.floor(Math.random() * 9) + 1}
                      </Badge>
                    )}
                    {otherUser.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
