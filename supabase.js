import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tnretjxfgobshscnzuas.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRucmV0anhmZ29ic2hzY256dWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTY2MjAsImV4cCI6MjEwNDc5MjYyMH0.-dh-ByaM9itOqnf58ETB64tYljQHaEn0a2EdOaKO2as';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);