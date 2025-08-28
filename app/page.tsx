"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { ProfileSetup } from "@/components/auth/profile-setup"
import { UserProfile } from "@/components/users/user-profile"
import { ChatList } from "@/components/chat/chat-list"
import { ChatWindow } from "@/components/chat/chat-window"
import { StartConversation } from "@/components/chat/start-conversation"
import { GroupList } from "@/components/groups/group-list"
import { CreateGroup } from "@/components/groups/create-group"
import { GroupManagement } from "@/components/groups/group-management"
import { StatusList } from "@/components/status/status-list"
import { UserSettings } from "@/components/settings/user-settings"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Users, Settings, User, Plus, ArrowLeft } from "lucide-react"
import { useChatRooms } from "@/hooks/use-chat-rooms"
import { useUsers } from "@/hooks/use-users"
import { useUnreadCount } from "@/hooks/use-unread-count"
import type { UserChat, ChatRoom } from "@/types/chat"
import { OfflineIndicator } from "@/components/layout/offline-indicator"
import { MessageSearch } from "@/components/search/message-search"

export default function HomePage() {
  const { user, loading, logout } = useAuth()
  const { createOrGetIndividualChat } = useChatRooms()
  const { users } = useUsers()
  const { unreadCount } = useUnreadCount()
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [newUser, setNewUser] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserChat | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<ChatRoom | null>(null)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("conversations")
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showGroupManagement, setShowGroupManagement] = useState<ChatRoom | null>(null)
  const [showMessageSearch, setShowMessageSearch] = useState(false)

  const handleStartChat = async (otherUser: UserChat) => {
    try {
      const chatId = await createOrGetIndividualChat(otherUser)
      setActiveChatId(chatId)
      setSelectedUser(otherUser)
      setSelectedGroup(null)
      setActiveTab("conversations")
    } catch (error) {
      console.error("Error starting chat:", error)
    }
  }

  const handleStartChatById = async (userId: string) => {
    const otherUser = users.find((u) => u.uid === userId)
    if (otherUser) {
      await handleStartChat(otherUser)
    }
  }

  const handleChatSelect = (chatId: string, otherUserId: string) => {
    const otherUser = users.find((u) => u.uid === otherUserId)
    if (otherUser) {
      setActiveChatId(chatId)
      setSelectedUser(otherUser)
      setSelectedGroup(null)
    }
  }

  const handleGroupSelect = (groupId: string, group: ChatRoom) => {
    setActiveChatId(groupId)
    setSelectedGroup(group)
    setSelectedUser(null)
  }

  const handleGroupCreated = (groupId: string) => {
    setShowCreateGroup(false)
    // Optionally switch to the new group
    setActiveTab("conversations")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (showProfileSetup && newUser) {
    return (
      <ProfileSetup
        user={newUser}
        onComplete={() => {
          setShowProfileSetup(false)
          setNewUser(null)
        }}
      />
    )
  }

  if (!user) {
    if (authMode === "login") {
      return <LoginForm onSwitchToRegister={() => setAuthMode("register")} />
    } else {
      return (
        <RegisterForm
          onSwitchToLogin={() => setAuthMode("login")}
          onRegistrationComplete={(user) => {
            setNewUser(user)
            setShowProfileSetup(true)
          }}
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            {activeChatId && (
              <Button
                size="sm"
                variant="ghost"
                className="md:hidden"
                onClick={() => {
                  setActiveChatId(null)
                  setSelectedUser(null)
                  setSelectedGroup(null)
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">ChatBloom</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={() => setShowProfile(true)} className="hidden md:flex">
              <User className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={logout} className="hidden md:flex bg-transparent">
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px-4rem)] md:h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className={`w-full md:w-80 border-r bg-card ${activeChatId ? "hidden md:block" : ""}`}>
          {showMessageSearch ? (
            <div className="p-4 h-full overflow-y-auto">
              <MessageSearch
                onClose={() => setShowMessageSearch(false)}
                onMessageSelect={(chatId, messageId) => {
                  // TODO: Navigate to specific message
                  setShowMessageSearch(false)
                }}
              />
            </div>
          ) : showProfile ? (
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Perfil</h2>
                <Button size="sm" variant="ghost" onClick={() => setShowProfile(false)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
              <UserProfile onClose={() => setShowProfile(false)} />
            </div>
          ) : showCreateGroup ? (
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Criar Grupo</h2>
                <Button size="sm" variant="ghost" onClick={() => setShowCreateGroup(false)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
              <CreateGroup onClose={() => setShowCreateGroup(false)} onGroupCreated={handleGroupCreated} />
            </div>
          ) : showGroupManagement ? (
            <div className="p-4 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Gerenciar Grupo</h2>
                <Button size="sm" variant="ghost" onClick={() => setShowGroupManagement(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
              <GroupManagement group={showGroupManagement} onClose={() => setShowGroupManagement(null)} />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Desktop Tabs */}
              <div className="hidden md:block p-4 pb-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="conversations" className="text-xs">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Conversas
                    </TabsTrigger>
                    <TabsTrigger value="status" className="text-xs">
                      <User className="w-4 h-4 mr-2" />
                      Status
                    </TabsTrigger>
                    <TabsTrigger value="groups" className="text-xs">
                      <Users className="w-4 h-4 mr-2" />
                      Grupos
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs">
                      <Settings className="w-4 h-4 mr-2" />
                      Config
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "conversations" && (
                  <div className="h-full p-4 pt-0 md:pt-4 overflow-y-auto">
                    <ChatList onChatSelect={handleChatSelect} />
                  </div>
                )}

                {activeTab === "status" && (
                  <div className="h-full p-4 pt-0 md:pt-4 overflow-y-auto">
                    <StatusList />
                  </div>
                )}

                {activeTab === "groups" && (
                  <div className="h-full p-4 pt-0 md:pt-4 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Meus Grupos</h3>
                      <Button size="sm" onClick={() => setShowCreateGroup(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar
                      </Button>
                    </div>
                    <GroupList onGroupSelect={handleGroupSelect} onManageGroup={setShowGroupManagement} />
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="h-full p-4 pt-0 md:pt-4 overflow-y-auto">
                    <UserSettings />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeChatId && (selectedUser || selectedGroup) ? (
            <ChatWindow
              chatId={activeChatId}
              otherUser={selectedUser!}
              onBack={() => {
                setActiveChatId(null)
                setSelectedUser(null)
                setSelectedGroup(null)
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2 text-muted-foreground">Bem-vindo ao ChatBloom!</h3>
                <p className="text-muted-foreground">
                  Selecione uma conversa, usuário ou grupo para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <StartConversation onStartChat={handleStartChatById} />

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} unreadCount={unreadCount} />
    </div>
  )
}
