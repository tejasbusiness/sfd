import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase/client'

export type UserRole = 'admin' | 'staff_support' | 'staff_sales' | 'customer'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  avatar_url: string | null
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  // Tracks whose profile `profile` currently reflects — starts null (no
  // fetch has ever completed). Comparing this against session?.user?.id
  // (rather than a separate boolean flipped inside a useEffect) closes a
  // real race: a plain "profileLoading" boolean defaults to false on mount
  // and is only set to true INSIDE the effect that runs after session.user
  // first becomes non-null — so there is a real render, right after login,
  // where session.user is set but profileLoading hasn't flipped to true yet
  // and profile is still null. loading was false and profile was null at
  // the same time, which sent a legitimate admin straight to
  // RequireStaffRole's "not staff" redirect immediately after signing in.
  const [profileForUserId, setProfileForUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) {
      setProfile(null)
      setProfileForUserId(null)
      return
    }

    const userId = session.user.id
    supabase
      .from('profiles')
      .select('id, role, full_name, phone, avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        setProfile(data as Profile | null)
        setProfileForUserId(userId)
      })
  }, [session?.user])

  // A signed-in user's role isn't known until the profile fetch for THAT
  // user resolves, so callers that gate on role (e.g. RequireStaffRole)
  // must not treat profile === null as "not staff" while this is still
  // true — otherwise a real staff member gets redirected right after
  // logging in, before their profile has had a chance to load.
  const profileLoading = !!session?.user && profileForUserId !== session.user.id
  const loading = sessionLoading || profileLoading

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
  }

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut: AuthContextValue['signOut'] = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const resetPassword: AuthContextValue['resetPassword'] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
