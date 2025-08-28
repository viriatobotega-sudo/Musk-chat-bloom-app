"use client"

import { useState } from "react"
import { useUsers } from "@/hooks/use-users"
import { useChatRooms } from "@/hooks/use-chat-rooms"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Search, Users } from "lucide-react"

interface StartConversationProps {
  onStartChat: (userId: string) => void
}

export function StartConversation({ onStartChat }: StartConversationProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { users, onlineUsers } = useUsers()
  const { user } = useAuth()
  const { createChatRoom } = useChatRooms()

  const filteredUsers = users.filter(
    (u) =>
      u.id !== user?.uid &&
      (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phoneNumber?.includes(searchTerm)),
  )

  const handleStartChat = async (targetUserId: string) => {
    if (!user) return

    try {
      await createChatRoom(targetUserId, "individual")
      onStartChat(targetUserId)
      setOpen(false)
      setSearchTerm("")
    } catch (error) {
      console.error("Erro ao iniciar conversa:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 rounded-full w-14 h-14 shadow-lg z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Iniciar Conversa</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-80">
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              ) : (
                filteredUsers.map((targetUser) => {
                  const isOnline = onlineUsers.includes(targetUser.id)

                  return (
                    <div
                      key={targetUser.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleStartChat(targetUser.id)}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={targetUser.photoURL || ""} />
                          <AvatarFallback>
                            {targetUser.displayName?.charAt(0) || targetUser.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium truncate">{targetUser.displayName || "Usuário"}</p>
                          {isOnline && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              Online
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{targetUser.bio || targetUser.email}</p>
                        {targetUser.phoneNumber && (
                          <p className="text-xs text-muted-foreground">{targetUser.phoneNumber}</p>
                        )}
                      </div>

                      <Button size="sm" variant="ghost">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
