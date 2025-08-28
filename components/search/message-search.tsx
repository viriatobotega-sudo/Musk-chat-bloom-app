"use client"

import { useState } from "react"
import { useMessageSearch } from "@/hooks/use-message-search"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, X, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MessageSearchProps {
  onClose: () => void
  onMessageSelect?: (chatId: string, messageId: string) => void
}

export function MessageSearch({ onClose, onMessageSelect }: MessageSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const { searchResults, isSearching, searchMessages, clearSearch } = useMessageSearch()

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim()) {
      searchMessages(term)
    } else {
      clearSearch()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Buscar Mensagens</h2>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar mensagens..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isSearching && (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Buscando...</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{searchResults.length} resultado(s) encontrado(s)</p>
          {searchResults.map((message) => (
            <Card
              key={message.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onMessageSelect?.(message.chatId || "", message.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.senderPhotoURL || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{message.senderName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{message.senderName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(message.timestamp, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{message.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchTerm && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2 text-muted-foreground">Nenhuma mensagem encontrada</h3>
          <p className="text-muted-foreground">Tente usar palavras-chave diferentes</p>
        </div>
      )}
    </div>
  )
}
