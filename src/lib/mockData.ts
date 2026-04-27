import { supabase } from './supabase';

export const mockDb = {
  get: async (collection: string) => {
    try {
      const { data, error } = await supabase
        .from(collection)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error fetching ${collection}:`, error.message, error.details);
        return [];
      }
      
      return data.map(item => ({
        ...item,
        createdAt: { toDate: () => new Date(item.created_at) }
      }));
    } catch (e) {
      console.error(`Fatal error fetching ${collection}:`, e);
      return [];
    }
  },
  
  add: async (collection: string, data: any) => {
    try {
      const { createdAt, ...cleanData } = data;
      
      const { data: inserted, error } = await supabase
        .from(collection)
        .insert([cleanData])
        .select()
        .single();

      if (error) {
        console.error(`Error adding to ${collection}:`, error.message, error.details);
        throw error;
      }
      return {
        ...inserted,
        createdAt: { toDate: () => new Date(inserted.created_at) }
      };
    } catch (e: any) {
      console.error(`Fatal error adding to ${collection}:`, e);
      throw e;
    }
  },
  
  update: async (collection: string, id: string, data: any) => {
    try {
      const { createdAt, id: _, ...cleanData } = data;
      const { data: updated, error } = await supabase
        .from(collection)
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating ${collection}:`, error.message);
        throw error;
      }
      return updated;
    } catch (e: any) {
      console.error(`Fatal error updating ${collection}:`, e);
      throw e;
    }
  },
  
  delete: async (collection: string, id: string) => {
    try {
      const { error } = await supabase
        .from(collection)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting from ${collection}:`, error.message);
        throw error;
      }
      return true;
    } catch (e: any) {
      console.error(`Fatal error deleting from ${collection}:`, e);
      throw e;
    }
  },

  query: async (collection: string, field: string, value: any) => {
    try {
      const { data, error } = await supabase
        .from(collection)
        .select('*')
        .eq(field, value);
      
      if (error) {
        console.error(`Error querying ${collection}:`, error.message);
        return [];
      }
      return data.map(item => ({
        ...item,
        createdAt: { toDate: () => new Date(item.created_at) }
      }));
    } catch (e) {
      console.error(`Fatal error querying ${collection}:`, e);
      return [];
    }
  }
};
