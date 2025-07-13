"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users } from "lucide-react"

interface User {
  id: string
  username: string
  publicKey: string
}

interface UserListProps {
  currentUser: User
  selectedUser: User | null
  onSelectUser: (user: User) => void
}

export function UserList({ currentUser, selectedUser, onSelectUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]")
    const otherUsers = allUsers.filter((u: User) => u.id !== currentUser.id)
    setUsers(otherUsers)
  }, [currentUser.id])

  const filteredUsers = users.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Contacts</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "No users found" : "No other users available"}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredUsers.map((user) => (
              <Button
                key={user.id}
                variant={selectedUser?.id === user.id ? "secondary" : "ghost"}
                className="w-full justify-start p-3 h-auto"
                onClick={() => onSelectUser(user)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-gray-100 text-gray-600">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{user.username}</div>
                  <div className="text-sm text-gray-500">Online</div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
