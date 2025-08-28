"use client"

import { MessageCircle, Users, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  unreadCount?: number
}

export function BottomNavigation({ activeTab, onTabChange, unreadCount = 0 }: BottomNavigationProps) {
  const tabs = [
    {
      id: "conversations",
      label: "Conversas",
      icon: MessageCircle,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      id: "status",
      label: "Status",
      icon: User,
    },
    {
      id: "groups",
      label: "Grupos",
      icon: Users,
    },
    {
      id: "settings",
      label: "Config",
      icon: Settings,
    },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 relative transition-colors touch-manipulation",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge && (
                  <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
