"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Settings, Lock } from "lucide-react"
import { useGroups } from "@/hooks/use-groups"
import { useUsers } from "@/hooks/use-users"
import { useAuth } from "@/lib/auth-context"
import type { ChatRoom } from "@/types/chat"

interface GroupListProps {
  onGroupSelect: (groupId: string, group: ChatRoom) => void
  onManageGroup: (group: ChatRoom) => void
}

export function GroupList({ onGroupSelect, onManageGroup }: GroupListProps) {
  const { groups, loading } = useGroups()
  const { users } = useUsers()
  const { user } = useAuth()

  const getParticipantNames = (group: ChatRoom) => {
    const participantNames = group.participants
      .filter((id) => id !== user?.uid)
      .map((id) => {
        const participant = users.find((u) => u.uid === id)
        return participant?.displayName || "Usuário"
      })
      .slice(0, 3)

    if (participantNames.length === 0) return "Apenas você"
    if (group.participants.length > 4) {
      return `${participantNames.join(", ")} e mais ${group.participants.length - 4}`
    }
    return participantNames.join(", ")
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

  const isAdmin = (group: ChatRoom) => {
    return group.admins?.includes(user?.uid || "") || false
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
      {groups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhum grupo</h3>
          <p>Crie ou participe de um grupo para começar</p>
        </div>
      ) : (
        groups.map((group) => (
          <Card key={group.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={group.groupPhoto || "/placeholder.svg"} />
                  <AvatarFallback>
                    <Users className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onGroupSelect(group.id, group)}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium truncate">{group.name}</h3>
                      {!group.isActive && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    {group.lastMessage && (
                      <span className="text-xs text-muted-foreground">{formatTime(group.lastMessage.timestamp)}</span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-1">{getParticipantNames(group)}</p>

                  {group.lastMessage ? (
                    <p className="text-sm text-muted-foreground truncate">
                      <span className="font-medium">{group.lastMessage.senderName}: </span>
                      {group.lastMessage.type === "text"
                        ? group.lastMessage.content
                        : `${group.lastMessage.type === "image" ? "📷" : "📎"} ${group.lastMessage.type}`}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">
                      {group.participants.length}
                    </Badge>
                    {isAdmin(group) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          onManageGroup(group)
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
