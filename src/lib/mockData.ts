import { supabase } from './supabase';

export const mockDb = {
  get: async (collection: string) => {
    const { data, error } = await supabase
      .from(collection)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching ${collection}:`, error);
      // Fallback to local storage if needed, but for now just return empty
      return [];
    }
    
    return data.map(item => ({
      ...item,
      createdAt: { toDate: () => new Date(item.created_at) }
    }));
  },
  
  add: async (collection: string, data: any) => {
    // Map application keys to database columns (snake_case if needed)
    const { createdAt, ...cleanData } = data;
    
    const { data: inserted, error } = await supabase
      .from(collection)
      .insert([cleanData])
      .select()
      .single();

    if (error) throw error;
    return {
      ...inserted,
      createdAt: { toDate: () => new Date(inserted.created_at) }
    };
  },
  
  update: async (collection: string, id: string, data: any) => {
    const { createdAt, id: _, ...cleanData } = data;
    const { error } = await supabase
      .from(collection)
      .update(cleanData)
      .eq('id', id);
    
    if (error) throw error;
  },
  
  delete: async (collection: string, id: string) => {
    const { error } = await supabase
      .from(collection)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  query: async (collection: string, field: string, value: any) => {
    const { data, error } = await supabase
      .from(collection)
      .select('*')
      .eq(field, value);
    
    if (error) return [];
    return data.map(item => ({
      ...item,
      createdAt: { toDate: () => new Date(item.created_at) }
    }));
  }
};
