// Встав сюди свої дані з Supabase → Project Settings → API
// SUPABASE_URL виглядає як https://xxxxxxxx.supabase.co
// SUPABASE_ANON_KEY — публічний ("anon") ключ, його можна безпечно тримати у клієнтському коді,
// бо доступ до даних контролюється RLS-політиками з schema.sql

const SUPABASE_URL = "https://ptupydcoysclmdjmwswt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_keSKBn0gFDOBG_b36mqXsg_NQelt3S_";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


