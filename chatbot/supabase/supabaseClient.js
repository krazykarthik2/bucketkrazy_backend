const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Add this line

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
