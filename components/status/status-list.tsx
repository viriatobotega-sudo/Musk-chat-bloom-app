"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUsers } from "@/hooks/use-users"
import { ref, push, onValue, off } from "firebase/database"
import { database } from "@/lib/firebase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Eye, Send } from "lucide-react"
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
  const [showCreateStatus, setShowCreateStatus] = useState(false)
  const [newStatusContent, setNewStatusContent] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const statusRef = ref(database, "status")
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const statusList = Object.entries(data).map(([id, status]: [string, any]) => ({
          id,
          ...status,
        })) as StatusUpdate[]

        // Filter status from last 24 hours
        const recentStatus = statusList.filter((status) => Date.now() - status.timestamp < 24 * 60 * 60 * 1000)

        setStatusUpdates(recentStatus.filter((s) => s.userId !== user.uid))
        setMyStatus(recentStatus.filter((s) => s.userId === user.uid))
      } else {
        setStatusUpdates([])
        setMyStatus([])
      }
    })

    return () => off(statusRef, "value", unsubscribe)
  }, [user])

  const createStatus = async () => {
    if (!user || !newStatusContent.trim()) return

    setLoading(true)
    try {
      const statusRef = ref(database, "status")
      await push(statusRef, {
        userId: user.uid,
        content: newStatusContent.trim(),
        timestamp: Date.now(),
        views: [],
      })

      setNewStatusContent("")
      setShowCreateStatus(false)
    } catch (error) {
      console.error("Erro ao criar status:", error)
    } finally {
      setLoading(false)
    }
  }

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
              <Dialog open={showCreateStatus} onOpenChange={setShowCreateStatus}>
                <DialogTrigger asChild>
                  <Button size="sm" className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0">
                    <Plus className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Status</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="O que está acontecendo?"
                      value={newStatusContent}
                      onChange={(e) => setNewStatusContent(e.target.value)}
                      maxLength={280}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{newStatusContent.length}/280</span>
                      <Button onClick={createStatus} disabled={loading || !newStatusContent.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        {loading ? "Postando..." : "Postar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex-1">
              <p className="font-medium">Meu status</p>
              <p className="text-sm text-muted-foreground">
                {myStatus.length > 0 ? `${myStatus.length} atualizações` : "Toque para adicionar"}
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
                    {status.content && <p className="mt-2 text-sm">{status.content}</p>}
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
