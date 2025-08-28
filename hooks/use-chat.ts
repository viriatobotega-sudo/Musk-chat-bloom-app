"use client"

import { useState, useEffect, useCallback } from "react"
import { ref, push, onValue, off, set, remove } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import type { ChatMessage, ChatRoom, TypingStatus } from "@/types/chat"

export function useChat(chatId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([])
  const { user } = useAuth()

  // Load messages
  useEffect(() => {
    if (!chatId) {
      setLoading(false)
      return
    }

    const messagesRef = ref(database, `chats/${chatId}/messages`)
    const chatRef = ref(database, `chatrooms/${chatId}`)

    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messagesList = Object.entries(data).map(([id, message]: [string, any]) => ({
          id,
          ...message,
        }))
        messagesList.sort((a, b) => a.timestamp - b.timestamp)
        setMessages(messagesList)
      } else {
        setMessages([])
      }
      setLoading(false)
    })

    const unsubscribeChat = onValue(chatRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setChatRoom(data)
      }
    })

    return () => {
      off(messagesRef, "value", unsubscribeMessages)
      off(chatRef, "value", unsubscribeChat)
    }
  }, [chatId])

  // Listen for typing indicators
  useEffect(() => {
    if (!chatId) return

    const typingRef = ref(database, `typing/${chatId}`)

    const unsubscribe = onValue(typingRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const typingList = Object.values(data) as TypingStatus[]
        // Filter out current user and expired typing indicators
        const activeTyping = typingList.filter(
          (typing) => typing.userId !== user?.uid && Date.now() - typing.timestamp < 3000,
        )
        setTypingUsers(activeTyping)
      } else {
        setTypingUsers([])
      }
    })

    return () => off(typingRef, "value", unsubscribe)
  }, [chatId, user?.uid])

  const sendMessage = useCallback(
    async (
      content: string,
      type: "text" | "image" | "document" | "audio" = "text",
      fileUrl?: string,
      fileName?: string,
    ) => {
      if (!chatId || !user || !content.trim()) return

      const message: Omit<ChatMessage, "id"> = {
        senderId: user.uid,
        senderName: user.displayName || user.email || "Usuário",
        senderPhoto: user.photoURL,
        content: content.trim(),
        type,
        fileUrl,
        fileName,
        timestamp: Date.now(),
      }

      try {
        const messagesRef = ref(database, `chats/${chatId}/messages`)
        await push(messagesRef, message)

        // Update last message in chat room
        const chatRef = ref(database, `chatrooms/${chatId}`)
        await set(chatRef, {
          ...chatRoom,
          lastMessage: message,
        })
      } catch (error) {
        console.error("Error sending message:", error)
      }
    },
    [chatId, user, chatRoom],
  )

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!chatId || !user) return

      const typingRef = ref(database, `typing/${chatId}/${user.uid}`)

      if (isTyping) {
        await set(typingRef, {
          userId: user.uid,
          userName: user.displayName || user.email || "Usuário",
          chatId,
          timestamp: Date.now(),
        })
      } else {
        await remove(typingRef)
      }
    },
    [chatId, user],
  )

  return {
    messages,
    chatRoom,
    loading,
    typingUsers,
    sendMessage,
    setTyping,
  }
}
