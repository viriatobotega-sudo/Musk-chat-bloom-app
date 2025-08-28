"use client"

import type { TypingStatus } from "@/types/chat"

interface TypingIndicatorProps {
  typingUsers: TypingStatus[]
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} está digitando...`
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} e ${typingUsers[1].userName} estão digitando...`
    } else {
      return `${typingUsers.length} pessoas estão digitando...`
    }
  }

  return (
    <div className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  )
}
