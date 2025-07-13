"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Lock } from "lucide-react"
import { encryptMessage, decryptMessage } from "@/lib/crypto"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  encrypted: boolean
}

interface User {
  id: string
  username: string
  publicKey: string
  privateKey: string
}

interface ChatInterfaceProps {
  currentUser: User
  selectedUser: User | null
}

export function ChatInterface({ currentUser, selectedUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedUser) {
      loadMessages()
    }
  }, [selectedUser, currentUser.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = () => {
    if (!selectedUser) return

    const allMessages = JSON.parse(localStorage.getItem("messages") || "[]")
    const chatMessages = allMessages.filter(
      (msg: Message) =>
        (msg.senderId === currentUser.id && msg.receiverId === selectedUser.id) ||
        (msg.senderId === selectedUser.id && msg.receiverId === currentUser.id),
    )

    setMessages(
      chatMessages.sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    )
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser || loading) return

    setLoading(true)
    try {
      // Encrypt the message using the recipient's public key
      const encryptedContent = await encryptMessage(newMessage, selectedUser.publicKey)

      const message: Message = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        content: encryptedContent,
        timestamp: new Date().toISOString(),
        encrypted: true,
      }

      // Save to localStorage (in production, this would be sent to a server)
      const allMessages = JSON.parse(localStorage.getItem("messages") || "[]")
      allMessages.push(message)
      localStorage.setItem("messages", JSON.stringify(allMessages))

      setMessages((prev) => [...prev, message])
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setLoading(false)
    }
  }

  const decryptMessageContent = async (message: Message) => {
    if (!message.encrypted) return message.content

    try {
      // Use current user's private key to decrypt received messages
      // Use selected user's private key for sent messages (for display purposes)
      const privateKey = message.senderId === currentUser.id ? currentUser.privateKey : currentUser.privateKey

      return await decryptMessage(message.content, privateKey)
    } catch (error) {
      console.error("Failed to decrypt message:", error)
      return "[Decryption failed]"
    }
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a user from the sidebar to start a secure conversation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {selectedUser.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedUser.username}</h3>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <Lock className="h-3 w-3" />
              <span>End-to-end encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No messages yet. Start a secure conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUser.id}
              decryptContent={decryptMessageContent}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a secure message..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  decryptContent: (message: Message) => Promise<string>
}

function MessageBubble({ message, isOwn, decryptContent }: MessageBubbleProps) {
  const [decryptedContent, setDecryptedContent] = useState<string>("")

  useEffect(() => {
    decryptContent(message).then(setDecryptedContent)
  }, [message, decryptContent])

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
        }`}
      >
        <p className="text-sm">{decryptedContent || "Decrypting..."}</p>
        <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}
