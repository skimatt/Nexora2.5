// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ndiuwutdmcxkhtxruxor.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kaXV3dXRkbWN4a2h0eHJ1eG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxODUwMjQsImV4cCI6MjA1OTc2MTAyNH0.PP-frp9aq4i0cXB_X6znORweSnVkpOqXkYRqhinyprc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
