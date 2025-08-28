"use client"

import { useState, useEffect } from "react"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, X, MessageCircle, Phone, Mail, Clock } from "lucide-react"
import type { UserChat } from "@/types/chat"

interface FriendProfileProps {
  userId: string
  onClose?: () => void
  onStartChat?: (user: UserChat) => void
}

export function FriendProfile({ userId, onClose, onStartChat }: FriendProfileProps) {
  const [user, setUser] = useState<UserChat | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = ref(database, `userschat/${userId}`)
        const snapshot = await get(userRef)

        if (snapshot.exists()) {
          setUser(snapshot.val())
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [userId])

  const formatLastSeen = (timestamp?: number) => {
    if (!timestamp) return "Nunca visto"

    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Agora"
    if (minutes < 60) return `${minutes} min atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between">
          <CardTitle>Perfil do Usuário</CardTitle>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.photoURL || "/placeholder.svg"} />
              <AvatarFallback>
                {user.displayName?.charAt(0)?.toUpperCase() || <User className="w-12 h-12" />}
              </AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold">{user.displayName || "Usuário"}</h3>
            <div className="flex items-center justify-center space-x-2 mt-2">
              {user.isOnline ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatLastSeen(user.lastSeen)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {user.email && (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </Label>
              <p className="text-sm p-2 bg-muted rounded">{user.email}</p>
            </div>
          )}

          {user.phoneNumber && (
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Telefone</span>
              </Label>
              <p className="text-sm p-2 bg-muted rounded">{user.phoneNumber}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Biografia</Label>
            <p className="text-sm p-2 bg-muted rounded min-h-[60px]">{user.bio || "Nenhuma biografia disponível"}</p>
          </div>

          <div className="space-y-2">
            <Label>Membro desde</Label>
            <p className="text-sm p-2 bg-muted rounded">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "Data não disponível"}
            </p>
          </div>
        </div>

        {onStartChat && (
          <div className="pt-4">
            <Button onClick={() => onStartChat(user)} className="w-full" size="lg">
              <MessageCircle className="w-4 h-4 mr-2" />
              Iniciar Conversa
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
