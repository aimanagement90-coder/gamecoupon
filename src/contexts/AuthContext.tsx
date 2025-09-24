import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
      setSupabaseError('Supabase yapılandırması eksik. Lütfen sağ üst köşedeki "Connect to Supabase" butonuna tıklayın.')
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    if (supabaseError) {
      return { data: null, error: { message: supabaseError } }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (!error && data.user) {
      // Create profile
      await supabase.from('profiles').insert([
        {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        },
      ])
    }

    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    if (supabaseError) {
      return { data: null, error: { message: supabaseError } }
    }

    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    if (supabaseError) return
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    if (supabaseError) {
      return { data: null, error: { message: supabaseError } }
    }

    return await supabase.auth.resetPasswordForEmail(email)
  }

  // Show configuration error if Supabase is not set up
  if (supabaseError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Yapılandırma Gerekli
          </h2>
          <p className="text-gray-600 mb-6">
            {supabaseError}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Nasıl Yapılandırılır:</h3>
            <ol className="text-blue-800 text-sm space-y-1">
              <li>1. Sağ üst köşedeki "Connect to Supabase" butonuna tıklayın</li>
              <li>2. Supabase hesabınızla giriş yapın</li>
              <li>3. Proje oluşturun veya mevcut projeyi seçin</li>
              <li>4. Veritabanı şeması otomatik olarak oluşturulacak</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}