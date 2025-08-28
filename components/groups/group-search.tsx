"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Lock, Unlock } from "lucide-react"
import { useGroups } from "@/hooks/use-groups"
import type { ChatRoom } from "@/types/chat"

interface GroupSearchProps {
  onGroupSelect?: (group: ChatRoom) => void
  onJoinGroup?: (group: ChatRoom) => void
}

export function GroupSearch({ onGroupSelect, onJoinGroup }: GroupSearchProps) {
  const { searchPublicGroups } = useGroups()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ChatRoom[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const searchResults = await searchPublicGroups(query)
      setResults(searchResults)
    } catch (error) {
      console.error("Error searching groups:", error)
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
            placeholder="Buscar grupos públicos..."
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
          <h3 className="font-medium text-sm text-muted-foreground">{results.length} grupo(s) encontrado(s)</h3>
          {results.map((group) => (
            <Card key={group.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={group.groupPhoto || "/placeholder.svg"} />
                    <AvatarFallback>
                      <Users className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium truncate">{group.name}</h3>
                      {group.isActive ? (
                        <Unlock className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground truncate mb-1">{group.description}</p>
                    )}
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {group.participants.length} membros
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {onGroupSelect && (
                      <Button size="sm" variant="outline" onClick={() => onGroupSelect(group)}>
                        <Users className="w-4 h-4" />
                      </Button>
                    )}
                    {onJoinGroup && group.isActive && (
                      <Button size="sm" onClick={() => onJoinGroup(group)}>
                        Participar
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
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum grupo encontrado</p>
          <p className="text-sm">Tente buscar por nome ou descrição</p>
        </div>
      )}

      {!query && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Digite para buscar grupos</p>
          <p className="text-sm">Encontre grupos públicos para participar</p>
        </div>
      )}
    </div>
  )
}
