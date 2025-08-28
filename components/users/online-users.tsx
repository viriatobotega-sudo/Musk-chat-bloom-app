"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import type { UserChat } from "@/types/chat"

interface OnlineUsersProps {
  onUserSelect?: (user: UserChat) => void
}

export function OnlineUsers({ onUserSelect }: OnlineUsersProps) {
  const { onlineUsers, loading } = useUsers()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuários Online</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Usuários Online</CardTitle>
          <Badge variant="secondary">{onlineUsers.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {onlineUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Nenhum usuário online</p>
        ) : (
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div
                key={user.uid}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onUserSelect?.(user)}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.displayName}</p>
                  {user.bio && <p className="text-xs text-muted-foreground truncate">{user.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
