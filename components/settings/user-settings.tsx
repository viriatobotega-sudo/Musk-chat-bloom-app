"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/hooks/use-theme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Bell,
  Shield,
  Moon,
  Globe,
  HelpCircle,
  LogOut,
  Camera,
  Edit3,
  Search,
  Download,
  Smartphone,
} from "lucide-react"

export function UserSettings() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [bio, setBio] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [messageNotifications, setMessageNotifications] = useState(true)
  const [groupNotifications, setGroupNotifications] = useState(true)
  const [language, setLanguage] = useState("pt-BR")
  const [showMessageSearch, setShowMessageSearch] = useState(false)

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Perfil</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.photoURL || ""} />
                <AvatarFallback className="text-lg">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" variant="secondary" className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Nome</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={!isEditing}
                placeholder="Seu nome"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
            </div>

            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={!isEditing}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>

            {isEditing && (
              <Button onClick={handleSave} className="w-full">
                Salvar Alterações
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notificações</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações push</p>
              <p className="text-sm text-muted-foreground">Receber notificações de novas mensagens</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mensagens individuais</p>
              <p className="text-sm text-muted-foreground">Notificações de chats individuais</p>
            </div>
            <Switch checked={messageNotifications} onCheckedChange={setMessageNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mensagens de grupo</p>
              <p className="text-sm text-muted-foreground">Notificações de grupos</p>
            </div>
            <Switch checked={groupNotifications} onCheckedChange={setGroupNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="w-5 h-5" />
            <span>Aparência</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tema</p>
              <p className="text-sm text-muted-foreground">Escolha entre claro, escuro ou automático</p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Idioma</p>
              <p className="text-sm text-muted-foreground">Idioma da interface</p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português</SelectItem>
                <SelectItem value="en-US">English</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Ferramentas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start bg-transparent"
            onClick={() => setShowMessageSearch(true)}
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar Mensagens
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Exportar Conversas
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Smartphone className="w-4 h-4 mr-2" />
            Dispositivos Conectados
          </Button>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Privacidade e Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Shield className="w-4 h-4 mr-2" />
            Configurações de Privacidade
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <Globe className="w-4 h-4 mr-2" />
            Bloqueados
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Criptografia de mensagens</p>
              <p className="text-sm text-muted-foreground">Mensagens são criptografadas ponta a ponta</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5" />
            <span>Ajuda e Suporte</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start bg-transparent">
            <HelpCircle className="w-4 h-4 mr-2" />
            Central de Ajuda
          </Button>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>ChatBloom v1.0.0</p>
            <p>Desenvolvido com ❤️</p>
            <div className="pt-2 border-t">
              <p className="font-medium text-foreground">Criadores:</p>
              <p>Ellon Musk dev - Milionário deve</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Logout */}
      <Button variant="destructive" onClick={logout} className="w-full">
        <LogOut className="w-4 h-4 mr-2" />
        Sair da Conta
      </Button>
    </div>
  )
}
