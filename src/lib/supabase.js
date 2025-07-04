// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yxwtepzkcvjmufmasrks.supabase.co'         // <- CAMBIA ESTO
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d3RlcHprY3ZqbXVmbWFzcmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODUxMzcsImV4cCI6MjA2NTA2MTEzN30.uawEZTfytXoe7N0Qg7NTJWmDBaXpnokhtuZsvn1fSUk'     // <- Y ESTO

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
