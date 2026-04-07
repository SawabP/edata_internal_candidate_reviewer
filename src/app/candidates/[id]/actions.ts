'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateCandidateStatus(id: string, status: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('candidate_analysis')
    .update({ status })
    .eq('id', id);
    
  if (error) {
    console.error("Failed to update status", error);
    throw new Error(error.message);
  }
  
  revalidatePath('/', 'layout');
}
