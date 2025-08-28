"use client"

import type React from "react"
import { useState } from "react"
import { ref, update } from "firebase/database"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { database, storage } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, User } from "lucide-react"

interface ProfileSetupProps {
  user: any
  onComplete: () => void
}

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const url = URL.createObjectURL(file)
      setProfileImageUrl(url)
    }
  }

  const handleComplete = async () => {
    setLoading(true)

    try {
      let photoURL = ""

      // Upload profile image if selected
      if (profileImage) {
        const imageRef = storageRef(storage, `profiles/${user.uid}`)
        await uploadBytes(imageRef, profileImage)
        photoURL = await getDownloadURL(imageRef)

        // Update Firebase Auth profile
        await updateProfile(user, { photoURL })
      }

      // Update user data in database
      const updates = {
        bio,
        ...(photoURL && { photoURL }),
      }

      await update(ref(database, `userschat/${user.uid}`), updates)

      onComplete()
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete seu Perfil</CardTitle>
          <CardDescription>Adicione uma foto e biografia</CardDescription>
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
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90"
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </label>
              <input id="profile-image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              placeholder="Conte um pouco sobre você..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onComplete} className="flex-1 bg-transparent">
              Pular
            </Button>
            <Button onClick={handleComplete} disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Concluir"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
