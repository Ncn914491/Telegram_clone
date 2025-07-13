"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat/chat-interface"
import { UserList } from "@/components/chat/user-list"
import { Header } from "@/components/chat/header"

export default function ChatPage() {
  const [user, setUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/")
      return
    }
    setUser(JSON.parse(storedUser))
  }, [router])

  if (!user) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex-1 flex overflow-hidden">
        <UserList currentUser={user} selectedUser={selectedUser} onSelectUser={setSelectedUser} />
        <ChatInterface currentUser={user} selectedUser={selectedUser} />
      </div>
    </div>
  )
}
