import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pgquzbzupirlbtucrjfg.supabase.co'
const supabaseKey = 'sb_publishable_823YwWjBJlgCZ66bdZrb9w_oAiIZA5H'

export const supabase = createClient(supabaseUrl, supabaseKey)