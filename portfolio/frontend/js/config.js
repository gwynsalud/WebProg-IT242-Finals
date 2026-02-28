// 1. SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://bkcgisyloqvdgtqxnljt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Txbr87_gy1zFnAJU6EeG6g_tQVSf3pb';

// 2. INITIALIZE CLIENT
// Since we load the Supabase CDN in HTML, 'supabase' is available globally
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 3. GLOBAL APP CONSTANTS
const RPG_CONFIG = {
    PROJECT_NAME: "The Scholar's Deck",
    VERSION: "2.0.0",
    TABLE_NAME: "visitors"
};