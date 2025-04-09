// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://egmhxsmsblmcdetcpmdh.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbWh4c21zYmxtY2RldGNwbWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNzY5MTUsImV4cCI6MjA1OTc1MjkxNX0.1AA8sY9u6mFBPA4_H0Agu85Ojp7v7BlybxcHNoaf_CA'; // Replace with your Supabase anon key

// Create a Supabase client instance
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the created supabase client instance
export default supabase;
