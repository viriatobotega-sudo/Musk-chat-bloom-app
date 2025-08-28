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
  onStartChat: (chatRoomId: string) => void
}

export function StartConversation({ onStartChat }: StartConversationProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { users, onlineUsers, loading } = useUsers()
  const { user } = useAuth()
  const { createOrGetIndividualChat } = useChatRooms()

  console.log("[v0] StartConversation - usuários recebidos:", users.length)
  console.log("[v0] StartConversation - loading:", loading)

  const filteredUsers = users.filter(
    (u) =>
      u.uid !== user?.uid &&
      (searchTerm === "" ||
        (u.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.phoneNumber || "").includes(searchTerm)),
  )

  console.log("[v0] StartConversation - usuários filtrados:", filteredUsers.length)

  const handleStartChat = async (targetUserId: string) => {
    if (!user) return

    try {
      const targetUser = users.find((u) => u.uid === targetUserId)
      if (!targetUser) {
        console.error("Usuário alvo não encontrado")
        return
      }

      console.log("[v0] Iniciando conversa com:", targetUser.displayName || targetUser.email)
      const chatRoomId = await createOrGetIndividualChat(targetUser)
      console.log("[v0] Chat room criado/encontrado:", chatRoomId)

      onStartChat(chatRoomId)
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
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Carregando usuários...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{searchTerm ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado ainda"}</p>
                  {!searchTerm && (
                    <div className="text-xs mt-2 space-y-1">
                      <p>Seja o primeiro a convidar amigos!</p>
                      <p>Total de usuários no sistema: {users.length}</p>
                    </div>
                  )}
                </div>
              ) : (
                filteredUsers.map((targetUser) => {
                  const isOnline = onlineUsers.includes(targetUser.uid)

                  return (
                    <div
                      key={targetUser.uid}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleStartChat(targetUser.uid)}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={targetUser.photoURL || ""} />
                          <AvatarFallback>
                            {(targetUser.displayName || targetUser.email || "U").charAt(0).toUpperCase()}
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
