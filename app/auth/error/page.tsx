'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  let errorMessage = 'An error occurred during authentication'

  switch (error) {
    case 'Configuration':
      errorMessage = 'There is a problem with the server configuration.'
      break
    case 'AccessDenied':
      errorMessage = 'You do not have permission to sign in.'
      break
    case 'Verification':
      errorMessage = 'The verification token has expired or has already been used.'
      break
    case 'OAuthSignin':
      errorMessage = 'Error in the OAuth signin process.'
      break
    case 'OAuthCallback':
      errorMessage = 'Error in the OAuth callback process.'
      break
    case 'OAuthCreateAccount':
      errorMessage = 'Could not create OAuth provider account.'
      break
    case 'EmailCreateAccount':
      errorMessage = 'Could not create email provider account.'
      break
    case 'Callback':
      errorMessage = 'Error in the OAuth callback handler.'
      break
    case 'InvalidCredentials':
      errorMessage = 'Invalid email or password.'
      break
    case 'default':
      errorMessage = 'An unknown error occurred.'
      break
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
          <CardDescription className="text-center text-red-500">
            <Icons.warning className="h-8 w-8 mx-auto mb-2" />
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Please try again or contact support if the problem persists.
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth/login">
              <Icons.arrowRight className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
