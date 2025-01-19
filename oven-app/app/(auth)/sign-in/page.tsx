'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const SignInPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')

    if (!username || !password) {
      setError('Please fill in both fields.')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid username or password.')
      }
    } catch (err) {
      setError('An error occurred during login.')
    }
  }

  return (
    <div className="login-container">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive" className="error-message">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="submit-btn">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="sign-up-container">
        <p>
          Don't have an account?{' '}
          <Button
            variant="link"
            className="sign-up-btn"
            onClick={() => router.push('/sign-up')}
          >
            Sign Up
          </Button>
        </p>
      </div>

      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          font-weight: bold;
        }

        .submit-btn {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .submit-btn:hover {
          background-color: #005bb5;
        }

        .sign-up-container {
          margin-top: 20px;
          text-align: center;
        }

        .sign-up-btn {
          color: #0070f3;
          text-decoration: underline;
          cursor: pointer;
        }

        .sign-up-btn:hover {
          color: #005bb5;
        }

        .error-message {
          margin-top: 10px;
        }
      `}</style>
    </div>
  )
}

export default SignInPage