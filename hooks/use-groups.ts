"use client"

import { useState, useEffect, useCallback } from "react"
import { ref, push, onValue, off, update, remove } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import type { ChatRoom } from "@/types/chat"

export function useGroups() {
  const [groups, setGroups] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const groupsRef = ref(database, "chatrooms")

    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const groupsList = Object.entries(data)
          .map(([id, room]: [string, any]) => ({
            id,
            ...room,
          }))
          .filter((room) => room.type === "group" && room.participants.includes(user.uid))
          .sort((a, b) => (b.lastMessage?.timestamp || b.createdAt) - (a.lastMessage?.timestamp || a.createdAt))

        setGroups(groupsList)
      } else {
        setGroups([])
      }
      setLoading(false)
    })

    return () => off(groupsRef, "value", unsubscribe)
  }, [user])

  const createGroup = useCallback(
    async (name: string, description: string, participants: string[], groupPhoto?: string): Promise<string> => {
      if (!user) throw new Error("User not authenticated")

      const groupData: Omit<ChatRoom, "id"> = {
        name,
        description,
        type: "group",
        participants: [user.uid, ...participants],
        admins: [user.uid],
        createdBy: user.uid,
        createdAt: Date.now(),
        isActive: true,
        groupPhoto,
      }

      const groupsRef = ref(database, "chatrooms")
      const newGroupRef = await push(groupsRef, groupData)

      if (!newGroupRef.key) throw new Error("Failed to create group")

      return newGroupRef.key
    },
    [user],
  )

  const addParticipant = useCallback(
    async (groupId: string, userId: string) => {
      if (!user) return

      const groupRef = ref(database, `chatrooms/${groupId}`)
      const group = groups.find((g) => g.id === groupId)

      if (!group || !group.admins?.includes(user.uid)) {
        throw new Error("Only admins can add participants")
      }

      const updatedParticipants = [...group.participants, userId]
      await update(groupRef, { participants: updatedParticipants })
    },
    [user, groups],
  )

  const removeParticipant = useCallback(
    async (groupId: string, userId: string) => {
      if (!user) return

      const groupRef = ref(database, `chatrooms/${groupId}`)
      const group = groups.find((g) => g.id === groupId)

      if (!group || !group.admins?.includes(user.uid)) {
        throw new Error("Only admins can remove participants")
      }

      const updatedParticipants = group.participants.filter((id) => id !== userId)
      const updatedAdmins = group.admins?.filter((id) => id !== userId) || []

      await update(groupRef, {
        participants: updatedParticipants,
        admins: updatedAdmins,
      })
    },
    [user, groups],
  )

  const toggleGroupStatus = useCallback(
    async (groupId: string, isActive: boolean) => {
      if (!user) return

      const group = groups.find((g) => g.id === groupId)
      if (!group || !group.admins?.includes(user.uid)) {
        throw new Error("Only admins can change group status")
      }

      const groupRef = ref(database, `chatrooms/${groupId}`)
      await update(groupRef, { isActive })
    },
    [user, groups],
  )

  const makeAdmin = useCallback(
    async (groupId: string, userId: string) => {
      if (!user) return

      const group = groups.find((g) => g.id === groupId)
      if (!group || !group.admins?.includes(user.uid)) {
        throw new Error("Only admins can promote users")
      }

      const updatedAdmins = [...(group.admins || []), userId]
      const groupRef = ref(database, `chatrooms/${groupId}`)
      await update(groupRef, { admins: updatedAdmins })
    },
    [user, groups],
  )

  const removeAdmin = useCallback(
    async (groupId: string, userId: string) => {
      if (!user) return

      const group = groups.find((g) => g.id === groupId)
      if (!group || !group.admins?.includes(user.uid) || group.createdBy === userId) {
        throw new Error("Cannot remove group creator or insufficient permissions")
      }

      const updatedAdmins = group.admins?.filter((id) => id !== userId) || []
      const groupRef = ref(database, `chatrooms/${groupId}`)
      await update(groupRef, { admins: updatedAdmins })
    },
    [user, groups],
  )

  const leaveGroup = useCallback(
    async (groupId: string) => {
      if (!user) return

      const group = groups.find((g) => g.id === groupId)
      if (!group) return

      if (group.createdBy === user.uid) {
        // If creator is leaving, transfer ownership to another admin or delete group
        const otherAdmins = group.admins?.filter((id) => id !== user.uid) || []
        if (otherAdmins.length > 0) {
          // Transfer ownership to first admin
          const groupRef = ref(database, `chatrooms/${groupId}`)
          await update(groupRef, {
            createdBy: otherAdmins[0],
            participants: group.participants.filter((id) => id !== user.uid),
            admins: otherAdmins,
          })
        } else {
          // Delete group if no other admins
          const groupRef = ref(database, `chatrooms/${groupId}`)
          await remove(groupRef)
        }
      } else {
        // Regular member leaving
        const updatedParticipants = group.participants.filter((id) => id !== user.uid)
        const updatedAdmins = group.admins?.filter((id) => id !== user.uid) || []

        const groupRef = ref(database, `chatrooms/${groupId}`)
        await update(groupRef, {
          participants: updatedParticipants,
          admins: updatedAdmins,
        })
      }
    },
    [user, groups],
  )

  const searchPublicGroups = useCallback(async (query: string) => {
    // For now, return empty array - can be extended to search public groups
    return []
  }, [])

  return {
    groups,
    loading,
    createGroup,
    addParticipant,
    removeParticipant,
    toggleGroupStatus,
    makeAdmin,
    removeAdmin,
    leaveGroup,
    searchPublicGroups,
  }
}
