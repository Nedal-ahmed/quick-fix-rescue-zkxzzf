import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://yfvlxsqjvsbzbqsczuqt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmdmx4c3FqdnNiemJxc2N6dXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMDU2ODcsImV4cCI6MjA3OTY4MTY4N30.K8KJjGKVuvurOff3AjxXC1T0pr7ySsA5buOu9Yv1nRI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
