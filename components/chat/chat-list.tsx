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
    <div className="space-y-2">
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
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUser.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    {otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{otherUser.displayName}</h3>
                      {chatRoom.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chatRoom.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>

                    {chatRoom.lastMessage ? (
                      <p className="text-sm text-muted-foreground truncate">
                        {chatRoom.lastMessage.type === "text"
                          ? chatRoom.lastMessage.content
                          : `${chatRoom.lastMessage.type === "image" ? "📷" : "📎"} ${chatRoom.lastMessage.type}`}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
                    )}
                  </div>

                  {/* Unread messages indicator - placeholder for now */}
                  <div className="flex flex-col items-end space-y-1">
                    {otherUser.isOnline && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Online
                      </Badge>
                    )}
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
