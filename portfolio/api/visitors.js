import { createClient } from '@supabase/supabase-js';

// These variables will be pulled from Vercel's Environment Variables
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
    // 1. Fetching Entries (GET)
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('visitors')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // 2. Adding an Entry (POST)
    if (req.method === 'POST') {
        const { name, message, desired_class, avatar_url } = req.body;
        
        const { data, error } = await supabase
            .from('visitors')
            .insert([{ name, message, desired_class, avatar_url }])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data[0]);
    }

    // Fallback for other methods
    return res.status(405).json({ error: 'Method not allowed' });
}