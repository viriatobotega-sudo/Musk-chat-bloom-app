"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUsers } from "@/hooks/use-users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface StatusUpdate {
  id: string
  userId: string
  content: string
  mediaUrl?: string
  mediaType?: "image" | "video"
  timestamp: number
  views: string[]
}

export function StatusList() {
  const { user } = useAuth()
  const { users } = useUsers()
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  const [myStatus, setMyStatus] = useState<StatusUpdate[]>([])

  // Mock data for demonstration
  useEffect(() => {
    const mockStatuses: StatusUpdate[] = [
      {
        id: "1",
        userId: "user1",
        content: "Trabalhando em um novo projeto!",
        timestamp: Date.now() - 3600000, // 1 hour ago
        views: [],
      },
      {
        id: "2",
        userId: "user2",
        content: "Bom dia pessoal!",
        mediaUrl: "/vibrant-mountain-sunrise.png",
        mediaType: "image",
        timestamp: Date.now() - 7200000, // 2 hours ago
        views: [],
      },
    ]
    setStatusUpdates(mockStatuses)
  }, [])

  const getUserById = (userId: string) => {
    return users.find((u) => u.uid === userId)
  }

  return (
    <div className="space-y-4">
      {/* My Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <Button size="sm" className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="font-medium">Meu status</p>
              <p className="text-sm text-muted-foreground">
                {myStatus.length > 0 ? "Toque para ver" : "Toque para adicionar"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      {statusUpdates.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Atualizações recentes</h3>
          <div className="space-y-2">
            {statusUpdates.map((status) => {
              const statusUser = getUserById(status.userId)
              if (!statusUser) return null

              return (
                <Card key={status.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12 ring-2 ring-primary ring-offset-2">
                          <AvatarImage src={statusUser.photoURL || ""} />
                          <AvatarFallback>
                            {statusUser.displayName?.charAt(0) || statusUser.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{statusUser.displayName || statusUser.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(status.timestamp, {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{status.views.length}</span>
                      </div>
                    </div>
                    {status.content && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{status.content}</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {statusUpdates.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2 text-muted-foreground">Nenhum status ainda</h3>
          <p className="text-muted-foreground">Quando seus contatos postarem status, eles aparecerão aqui</p>
        </div>
      )}
    </div>
  )
}
