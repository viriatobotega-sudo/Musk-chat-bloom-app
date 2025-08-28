export interface UserChat {
  uid: string
  email: string
  displayName: string
  phoneNumber?: string
  photoURL?: string
  bio?: string
  isOnline: boolean
  lastSeen: number
  createdAt: number
}

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderPhoto?: string
  content: string
  type: "text" | "image" | "document" | "audio"
  fileUrl?: string
  fileName?: string
  timestamp: number
  edited?: boolean
  editedAt?: number
}

export interface ChatRoom {
  id: string
  name?: string
  type: "individual" | "group"
  participants: string[]
  admins?: string[]
  createdBy: string
  createdAt: number
  lastMessage?: ChatMessage
  isActive: boolean
  groupPhoto?: string
  description?: string
}

export interface TypingStatus {
  userId: string
  userName: string
  chatId: string
  timestamp: number
}
