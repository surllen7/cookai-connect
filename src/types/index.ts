export interface Ingredient {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
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
  height: string;
}
