import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class GuildService implements OnModuleInit {
  private supabase: SupabaseClient;

  // This runs after the ConfigModule has loaded the variables
  onModuleInit() {
    const url = process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

    if (!url || !key) {
      console.error('CRITICAL: Supabase URL or Key is missing from Environment Variables!');
      return;
    }

    this.supabase = createClient(url, key);
  }

  async addEntry(visitorData: any) {
    if (!this.supabase) throw new Error('Database not initialized');
    
    const { data, error } = await this.supabase
      .from('visitors')
      .insert([visitorData]);
    
    if (error) throw error;
    return data;
  }

  async getEntries() {
    if (!this.supabase) throw new Error('Database not initialized');

    const { data, error } = await this.supabase
      .from('visitors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}