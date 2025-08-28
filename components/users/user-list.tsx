"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, User, MessageCircle } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import type { UserChat } from "@/types/chat"
import { Button } from "@/components/ui/button"

interface UserListProps {
  onUserSelect?: (user: UserChat) => void
  showOnlineOnly?: boolean
}

export function UserList({ onUserSelect, showOnlineOnly = false }: UserListProps) {
  const { users, onlineUsers, loading, searchUsers } = useUsers()
  const [searchQuery, setSearchQuery] = useState("")

  const displayUsers = showOnlineOnly ? onlineUsers : searchUsers(searchQuery)

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Agora mesmo"
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!showOnlineOnly && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <div className="space-y-2">
        {displayUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {showOnlineOnly ? "Nenhum usuário online" : "Nenhum usuário encontrado"}
          </div>
        ) : (
          displayUsers.map((user) => (
            <Card
              key={user.uid}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onUserSelect?.(user)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{user.displayName}</h3>
                      <div className="flex items-center space-x-2">
                        {user.isOnline ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Online
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{formatLastSeen(user.lastSeen)}</span>
                        )}
                        {onUserSelect && (
                          <Button size="sm" variant="ghost">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {user.bio && <p className="text-sm text-muted-foreground truncate mt-1">{user.bio}</p>}
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
