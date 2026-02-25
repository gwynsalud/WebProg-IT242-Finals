import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class GuildService {
  // Use environment variables for security! 
  private supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_ANON_KEY
  );

  async addEntry(visitorData: any) {
    const { data, error } = await this.supabase
      .from('visitors') // Matches your current table name
      .insert([visitorData]);
    
    if (error) throw error;
    return data;
  }

  async getEntries() {
    const { data, error } = await this.supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}