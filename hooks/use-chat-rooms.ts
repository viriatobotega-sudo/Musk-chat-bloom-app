"use client"

import { useState, useEffect } from "react"
import { ref, onValue, off, push } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import type { ChatRoom, UserChat } from "@/types/chat"

export function useChatRooms() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const chatRoomsRef = ref(database, "chatrooms")

    const unsubscribe = onValue(chatRoomsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const roomsList = Object.entries(data)
          .map(([id, room]: [string, any]) => ({
            id,
            ...room,
          }))
          .filter((room) => room.participants.includes(user.uid))
          .sort((a, b) => (b.lastMessage?.timestamp || b.createdAt) - (a.lastMessage?.timestamp || a.createdAt))

        setChatRooms(roomsList)
      } else {
        setChatRooms([])
      }
      setLoading(false)
    })

    return () => off(chatRoomsRef, "value", unsubscribe)
  }, [user])

  const createOrGetIndividualChat = async (otherUser: UserChat): Promise<string> => {
    if (!user) throw new Error("User not authenticated")

    // Check if chat already exists
    const existingChat = chatRooms.find(
      (room) =>
        room.type === "individual" &&
        room.participants.length === 2 &&
        room.participants.includes(user.uid) &&
        room.participants.includes(otherUser.uid),
    )

    if (existingChat) {
      return existingChat.id
    }

    // Create new individual chat
    const chatRoom: Omit<ChatRoom, "id"> = {
      type: "individual",
      participants: [user.uid, otherUser.uid],
      createdBy: user.uid,
      createdAt: Date.now(),
      isActive: true,
    }

    const chatRoomsRef = ref(database, "chatrooms")
    const newChatRef = await push(chatRoomsRef, chatRoom)

    if (!newChatRef.key) throw new Error("Failed to create chat room")

    return newChatRef.key
  }

  return {
    chatRooms,
    loading,
    createOrGetIndividualChat,
  }
}
