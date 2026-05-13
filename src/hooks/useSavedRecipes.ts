import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Recipe } from '../types';

export interface SavedRecipe {
  id: string;
  recipe: Recipe;
  saved_at: string;
}

// Maps a recipes table row to the SavedRecipe shape used by the UI
function rowToSaved(row: {
  id: string;
  title: string;
  title_en: string | null;
  cook_time: string | null;
  difficulty: string | null;
  servings: string | null;
  ingredients: unknown;
  steps: unknown;
  tip: string | null;
  created_at: string;
}): SavedRecipe {
  return {
    id: row.id,
    saved_at: row.created_at,
    recipe: {
      name: row.title,
      nameEn: row.title_en ?? '',
      cookTime: row.cook_time ?? '',
      difficulty: row.difficulty ?? '',
      servings: row.servings ?? '',
      ingredients: (row.ingredients as Recipe['ingredients']) ?? [],
      steps: (row.steps as Recipe['steps']) ?? [],
      tip: row.tip ?? undefined,
    },
  };
}

export function useSavedRecipes(userId: string | undefined) {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('recipes')
      .select('id, title, title_en, cook_time, difficulty, servings, ingredients, steps, tip, created_at')
      .eq('user_id', userId)
      .eq('source', 'ai')
      .order('created_at', { ascending: false });
    setSavedRecipes((data ?? []).map(rowToSaved));
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const saveRecipe = async (recipe: Recipe): Promise<{ ok: boolean; id?: string }> => {
    if (!userId) return { ok: false };
    const { data, error } = await supabase.from('recipes').insert({
      user_id: userId,
      source: 'ai',
      title: recipe.name,
      title_en: recipe.nameEn,
      cook_time: recipe.cookTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tip: recipe.tip ?? null,
      is_public: false,
    }).select('id').single();
    if (!error) await fetchSaved();
    return { ok: !error, id: data?.id };
  };

  const removeRecipe = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (!error) setSavedRecipes((prev) => prev.filter((r) => r.id !== id));
    return !error;
  };

  const isRecipeSaved = (recipeName: string) =>
    savedRecipes.some((r) => r.recipe.name === recipeName);

  return { savedRecipes, loading, saveRecipe, removeRecipe, isRecipeSaved, refetch: fetchSaved };
}
