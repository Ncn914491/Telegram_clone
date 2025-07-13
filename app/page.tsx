"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, MessageCircle } from "lucide-react"

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      router.push("/chat")
    }
  }, [router])

  if (user) {
    return null // Will redirect to chat
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900">
              Secure
              <span className="text-blue-600"> Messaging</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Private, encrypted conversations without compromising your personal information.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-gray-700">End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-blue-600" />
              <span className="text-gray-700">No email or phone required</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-purple-600" />
              <span className="text-gray-700">Real-time messaging</span>
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to your secure account" : "Join our secure messaging platform"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLogin ? <LoginForm /> : <RegisterForm />}

            <div className="text-center">
              <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-sm">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
