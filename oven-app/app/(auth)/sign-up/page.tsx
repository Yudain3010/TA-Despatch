'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const SignUpPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Registration successful!');
        router.push('/sign-in');
      } else {
        setError(data.error || 'An error occurred during registration.');
      }
    } catch (err) {
      setError('An error occurred during registration.');
    }
  }

  return (
    <div className="register-container">
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive" className="error-message">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="success-message">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="submit-btn">
              Register
            </Button>
          </form>
        </CardContent>
      </Card>

      <style jsx>{`
        .register-container {
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

        .error-message, .success-message {
          margin-top: 10px;
        }
      `}</style>
    </div>
  )
}

export default SignUpPage
