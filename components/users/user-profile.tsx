"use client"

import type React from "react"

import { useState } from "react"
import { ref, update } from "firebase/database"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { database, storage } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Camera, User, Edit, Save, X } from "lucide-react"

interface UserProfileProps {
  onClose?: () => void
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: "",
    phoneNumber: user?.phoneNumber || "",
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState(user?.photoURL || "")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const url = URL.createObjectURL(file)
      setProfileImageUrl(url)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      let photoURL = user.photoURL

      // Upload new profile image if selected
      if (profileImage) {
        const imageRef = storageRef(storage, `profiles/${user.uid}`)
        await uploadBytes(imageRef, profileImage)
        photoURL = await getDownloadURL(imageRef)

        // Update Firebase Auth profile
        await updateProfile(user, {
          displayName: formData.displayName,
          photoURL,
        })
      } else if (formData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: formData.displayName })
      }

      // Update user data in database
      const updates = {
        displayName: formData.displayName,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
        ...(photoURL && { photoURL }),
      }

      await update(ref(database, `userschat/${user.uid}`), updates)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || "",
      bio: "",
      phoneNumber: user?.phoneNumber || "",
    })
    setProfileImageUrl(user?.photoURL || "")
    setProfileImage(null)
    setIsEditing(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between">
          <CardTitle>Meu Perfil</CardTitle>
          <div className="flex space-x-2">
            {!isEditing ? (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4" />
                </Button>
              </>
            )}
            {onClose && (
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileImageUrl || "/placeholder.svg"} />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </label>
            )}
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome</Label>
            {isEditing ? (
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">{user?.displayName || "Não informado"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <p className="text-sm p-2 bg-muted rounded">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Telefone</Label>
            {isEditing ? (
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">{formData.phoneNumber || "Não informado"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            {isEditing ? (
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={3}
                placeholder="Conte um pouco sobre você..."
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded min-h-[60px]">{formData.bio || "Nenhuma biografia"}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
