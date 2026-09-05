import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ctjnxkzchzcpionhjvyh.supabase.co';
const supabaseAnonKey = 'sb_publishable_NzGUNBXVd3lPZQTxDf8fEw__EBBCOA6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);