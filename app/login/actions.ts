'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for simplicity
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const headersList = await headers()

  // Construct origin dynamically to handle different environments (local, preview, production)
  let host = headersList.get('x-forwarded-host') || headersList.get('host') || ''
  if (host.includes(',')) host = host.split(',')[0].trim()

  let protocol = headersList.get('x-forwarded-proto') || 'https'
  if (protocol.includes(',')) protocol = protocol.split(',')[0].trim()

  // Default to http only for localhost
  if (!headersList.get('x-forwarded-proto') && host.includes('localhost')) {
    protocol = 'http'
  }

  const origin = `${protocol}://${host}`

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?message=Could not sign up user')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check email to continue sign in process')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
