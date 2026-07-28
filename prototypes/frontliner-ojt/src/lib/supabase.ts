import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://qbopyolzqwhestzbdvcu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFib3B5b2x6cXdoZXN0emJkdmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0OTgxMTYsImV4cCI6MjEwMDA3NDExNn0.W_Y3M5YnXzzc9Oiujst1B0TcPcuLTxlpvdoCrNgGJQk'
)
