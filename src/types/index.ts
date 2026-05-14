export interface Ingredient {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
  custom?: boolean;
}

export type IngredientCategory = 'meat' | 'vegetable' | 'condiment';

export interface IngredientsState {
  meat: Ingredient[];
  vegetable: Ingredient[];
  condiment: Ingredient[];
}

export interface Post {
  id: number;
  title: string;
  author: string;
  likes: number;
  image: string;
  height: number;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
}

export interface RecipeStep {
  title: string;
  content: string;
  imageUrl?: string;
}

export interface Recipe {
  name: string;
  nameEn: string;
  cookTime: string;
  difficulty: string;
  servings: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tip?: string;
  selectedFrom?: string[];
  selectionNote?: string;
}

// 推荐方案：包含完整菜谱数据，点击后无需二次调用
export interface RecipeSuggestion {
  name: string;
  nameEn: string;
  description: string;
  additionalIngredients: string[];
  cookTime: string;
  difficulty: string;
  servings: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tip?: string;
}

export type RecipeApiResponse =
  | { mode: 'recipe'; data: Recipe }
  | { mode: 'suggestions'; data: RecipeSuggestion[] };

export interface FlavorTag {
  id: string;
  label: string;
  emoji: string;
}

export interface CookMethodTag {
  id: string;
  label: string;
  emoji: string;
}

export interface UserPreferences {
  flavors: string[];
  cookMethods: string[];
}

