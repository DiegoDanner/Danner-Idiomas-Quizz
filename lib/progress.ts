import { supabase } from './supabase';

export interface QuizProgress {
  quiz_id: string;
  score: number;
  total_questions: number;
}

export const saveQuizProgress = async (progress: QuizProgress) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_progress')
      .insert([
        {
          user_id: user.id,
          quiz_id: progress.quiz_id,
          score: progress.score,
          total_questions: progress.total_questions,
          completed_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error saving progress:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Could not save progress: Supabase not configured');
    return null;
  }
};

export const getUserProgress = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching progress:', error.message);
      return [];
    }
    return data;
  } catch (err) {
    console.warn('Could not fetch progress: Supabase not configured');
    return [];
  }
};
