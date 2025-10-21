import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xidxxyeovqjjeexazvgt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZHh4eWVvdnFqamVleGF6dmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTQzMjQsImV4cCI6MjA3NjYzMDMyNH0.SLZVpgPAyC-NCJk1lrO5_z9RW734gJV39ucYbRoJi7A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
