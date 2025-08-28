"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Search, User, MessageCircle } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import type { UserChat } from "@/types/chat"

interface UserSearchProps {
  onUserSelect?: (user: UserChat) => void
  onStartChat?: (user: UserChat) => void
}

export function UserSearch({ onUserSelect, onStartChat }: UserSearchProps) {
  const { searchUsers } = useUsers()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserChat[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const searchResults = searchUsers(query)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">{results.length} usuário(s) encontrado(s)</h3>
          {results.map((user) => (
            <Card key={user.uid} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{user.displayName}</h3>
                    {user.bio && <p className="text-sm text-muted-foreground truncate">{user.bio}</p>}
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex space-x-2">
                    {onUserSelect && (
                      <Button size="sm" variant="outline" onClick={() => onUserSelect(user)}>
                        <User className="w-4 h-4" />
                      </Button>
                    )}
                    {onStartChat && (
                      <Button size="sm" onClick={() => onStartChat(user)}>
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {query && results.length === 0 && !isSearching && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum usuário encontrado</p>
          <p className="text-sm">Tente buscar por nome, email ou telefone</p>
        </div>
      )}
    </div>
  )
}
