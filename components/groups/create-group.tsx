"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Camera, Users, X } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import { useGroups } from "@/hooks/use-groups"

interface CreateGroupProps {
  onClose: () => void
  onGroupCreated: (groupId: string) => void
}

export function CreateGroup({ onClose, onGroupCreated }: CreateGroupProps) {
  const { users } = useUsers()
  const { createGroup } = useGroups()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupImage, setGroupImage] = useState<File | null>(null)
  const [groupImageUrl, setGroupImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setGroupImage(file)
      const url = URL.createObjectURL(file)
      setGroupImageUrl(url)
    }
  }

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError("Nome do grupo é obrigatório")
      return
    }

    if (selectedUsers.length === 0) {
      setError("Selecione pelo menos um participante")
      return
    }

    setLoading(true)
    setError("")

    try {
      // For now, we'll skip image upload and just create the group
      const groupId = await createGroup(formData.name, formData.description, selectedUsers)
      onGroupCreated(groupId)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Criar Grupo</span>
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Group Info */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={groupImageUrl || "/placeholder.svg"} />
                <AvatarFallback>
                  <Users className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="group-image"
                className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90"
              >
                <Camera className="w-3 h-3 text-primary-foreground" />
              </label>
              <input id="group-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <Label htmlFor="groupName">Nome do Grupo</Label>
                <Input
                  id="groupName"
                  placeholder="Digite o nome do grupo"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="groupDescription">Descrição (opcional)</Label>
            <Textarea
              id="groupDescription"
              placeholder="Descreva o propósito do grupo..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>
        </div>

        {/* Participants Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Participantes</Label>
            <span className="text-sm text-muted-foreground">{selectedUsers.length} selecionados</span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
            {users.map((user) => (
              <div
                key={user.uid}
                className="flex items-center space-x-3 p-2 rounded hover:bg-accent cursor-pointer"
                onClick={() => handleUserToggle(user.uid)}
              >
                <Checkbox checked={selectedUsers.includes(user.uid)} onChange={() => {}} />
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading} className="flex-1">
            {loading ? "Criando..." : "Criar Grupo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
