"use client"

import { useState } from "react"
import { ref as storageRef, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

export interface UploadProgress {
  progress: number
  isUploading: boolean
  error?: string
}

export function useMediaUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false,
  })
  const { user } = useAuth()

  const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          "image/jpeg",
          quality,
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const uploadFile = async (file: File, type: "image" | "document" | "audio"): Promise<string> => {
    if (!user) throw new Error("User not authenticated")

    setUploadProgress({ progress: 0, isUploading: true })

    try {
      let fileToUpload = file

      // Compress images
      if (type === "image" && file.type.startsWith("image/")) {
        fileToUpload = await compressImage(file)
      }

      const fileName = `${Date.now()}_${fileToUpload.name}`
      const fileRef = storageRef(storage, `${type}s/${user.uid}/${fileName}`)

      const uploadTask = uploadBytesResumable(fileRef, fileToUpload)

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setUploadProgress({ progress, isUploading: true })
          },
          (error) => {
            setUploadProgress({ progress: 0, isUploading: false, error: error.message })
            reject(error)
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              setUploadProgress({ progress: 100, isUploading: false })
              resolve(downloadURL)
            } catch (error) {
              reject(error)
            }
          },
        )
      })
    } catch (error: any) {
      setUploadProgress({ progress: 0, isUploading: false, error: error.message })
      throw error
    }
  }

  const resetProgress = () => {
    setUploadProgress({ progress: 0, isUploading: false })
  }

  return {
    uploadFile,
    uploadProgress,
    resetProgress,
  }
}
