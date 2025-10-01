'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import { AuthForm } from '@/components/auth/auth-form'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(data: { email: string; password: string }) {
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">SalesCallerAI</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm onSubmit={onSubmit} isLoading={isLoading} />
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
