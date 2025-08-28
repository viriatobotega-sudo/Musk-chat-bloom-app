"use client"

import { useOfflineSync } from "@/hooks/use-offline-sync"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, Clock } from "lucide-react"

export function OfflineIndicator() {
  const { isOnline, pendingMessages } = useOfflineSync()

  if (isOnline && pendingMessages.length === 0) {
    return null
  }

  return (
    <Alert className={`mb-4 ${isOnline ? "border-yellow-500" : "border-red-500"}`}>
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <>
            <Clock className="w-4 h-4 text-yellow-500" />
            <AlertDescription>{pendingMessages.length} mensagem(ns) aguardando sincronização</AlertDescription>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500" />
            <AlertDescription>
              Você está offline. Mensagens serão enviadas quando a conexão for restaurada.
            </AlertDescription>
          </>
        )}
      </div>
    </Alert>
  )
}
