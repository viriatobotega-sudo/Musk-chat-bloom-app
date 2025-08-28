"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Users, MoreVertical, UserPlus, UserMinus, Crown, Shield, Lock, Unlock, Search, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useUsers } from "@/hooks/use-users"
import { useGroups } from "@/hooks/use-groups"
import type { ChatRoom } from "@/types/chat"

interface GroupManagementProps {
  group: ChatRoom
  onClose: () => void
}

export function GroupManagement({ group, onClose }: GroupManagementProps) {
  const { user } = useAuth()
  const { users } = useUsers()
  const { addParticipant, removeParticipant, toggleGroupStatus, makeAdmin, removeAdmin, leaveGroup } = useGroups()
  const [showAddUser, setShowAddUser] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAction, setSelectedAction] = useState<{
    type: string
    userId?: string
    userName?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const isAdmin = group.admins?.includes(user?.uid || "") || false
  const isCreator = group.createdBy === user?.uid

  const groupParticipants = users.filter((u) => group.participants.includes(u.uid))
  const availableUsers = users.filter((u) => !group.participants.includes(u.uid))
  const filteredAvailableUsers = availableUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAction = async () => {
    if (!selectedAction || !user) return

    setLoading(true)
    try {
      switch (selectedAction.type) {
        case "addUser":
          if (selectedAction.userId) {
            await addParticipant(group.id, selectedAction.userId)
          }
          break
        case "removeUser":
          if (selectedAction.userId) {
            await removeParticipant(group.id, selectedAction.userId)
          }
          break
        case "makeAdmin":
          if (selectedAction.userId) {
            await makeAdmin(group.id, selectedAction.userId)
          }
          break
        case "removeAdmin":
          if (selectedAction.userId) {
            await removeAdmin(group.id, selectedAction.userId)
          }
          break
        case "toggleStatus":
          await toggleGroupStatus(group.id, !group.isActive)
          break
        case "leaveGroup":
          await leaveGroup(group.id)
          onClose()
          break
      }
    } catch (error: any) {
      console.error("Error performing action:", error)
    } finally {
      setLoading(false)
      setSelectedAction(null)
    }
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Gerenciar Grupo</span>
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={group.groupPhoto || "/placeholder.svg"} />
              <AvatarFallback>
                <Users className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{group.name}</h3>
              {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={group.isActive ? "default" : "secondary"}>
                  {group.isActive ? (
                    <>
                      <Unlock className="w-3 h-3 mr-1" />
                      Ativo
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Fechado
                    </>
                  )}
                </Badge>
                <span className="text-sm text-muted-foreground">{group.participants.length} participantes</span>
              </div>
            </div>
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={() => setSelectedAction({ type: "toggleStatus" })}>
                {group.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </Button>
            )}
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Participantes</h4>
              {isAdmin && (
                <Button size="sm" onClick={() => setShowAddUser(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {groupParticipants.map((participant) => {
                const isParticipantAdmin = group.admins?.includes(participant.uid) || false
                const isParticipantCreator = group.createdBy === participant.uid

                return (
                  <div key={participant.uid} className="flex items-center space-x-3 p-2 rounded hover:bg-accent">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={participant.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{participant.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">{participant.displayName}</p>
                        {isParticipantCreator && <Crown className="w-4 h-4 text-yellow-500" title="Criador" />}
                        {isParticipantAdmin && !isParticipantCreator && (
                          <Shield className="w-4 h-4 text-blue-500" title="Administrador" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{participant.email}</p>
                    </div>
                    {isAdmin && participant.uid !== user?.uid && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {!isParticipantAdmin && (
                            <DropdownMenuItem
                              onClick={() =>
                                setSelectedAction({
                                  type: "makeAdmin",
                                  userId: participant.uid,
                                  userName: participant.displayName,
                                })
                              }
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Tornar Admin
                            </DropdownMenuItem>
                          )}
                          {isParticipantAdmin && !isParticipantCreator && isCreator && (
                            <DropdownMenuItem
                              onClick={() =>
                                setSelectedAction({
                                  type: "removeAdmin",
                                  userId: participant.uid,
                                  userName: participant.displayName,
                                })
                              }
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Remover Admin
                            </DropdownMenuItem>
                          )}
                          {!isParticipantCreator && (
                            <DropdownMenuItem
                              onClick={() =>
                                setSelectedAction({
                                  type: "removeUser",
                                  userId: participant.uid,
                                  userName: participant.displayName,
                                })
                              }
                              className="text-destructive"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add Users Modal */}
          {showAddUser && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Adicionar Participantes</h4>
                <Button size="sm" variant="ghost" onClick={() => setShowAddUser(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredAvailableUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-accent cursor-pointer"
                    onClick={() =>
                      setSelectedAction({
                        type: "addUser",
                        userId: user.uid,
                        userName: user.displayName,
                      })
                    }
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button variant="destructive" onClick={() => setSelectedAction({ type: "leaveGroup" })} className="flex-1">
              {isCreator ? "Excluir Grupo" : "Sair do Grupo"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction?.type === "addUser" && `Adicionar ${selectedAction.userName} ao grupo?`}
              {selectedAction?.type === "removeUser" && `Remover ${selectedAction.userName} do grupo?`}
              {selectedAction?.type === "makeAdmin" && `Tornar ${selectedAction.userName} administrador?`}
              {selectedAction?.type === "removeAdmin" && `Remover ${selectedAction.userName} como administrador?`}
              {selectedAction?.type === "toggleStatus" &&
                `${group.isActive ? "Fechar" : "Abrir"} o grupo para mensagens?`}
              {selectedAction?.type === "leaveGroup" &&
                `${isCreator ? "Excluir permanentemente" : "Sair d"} este grupo?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={loading}>
              {loading ? "Processando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
