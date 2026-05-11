export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          email: string | null;
          bio: string | null;
          avatar_url: string | null;
          avatar_emoji: string;
          followers_count: number;
          following_count: number;
          recipes_count: number;
          posts_count: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          email?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          avatar_emoji?: string;
        };
        Update: {
          username?: string | null;
          email?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          avatar_emoji?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          source: 'ai' | 'user';
          title: string;
          title_en: string | null;
          cook_time: string | null;
          difficulty: string | null;
          servings: string | null;
          ingredients: import('./index').RecipeIngredient[] | null;
          steps: import('./index').RecipeStep[] | null;
          tip: string | null;
          cover_url: string | null;
          is_public: boolean;
          likes_count: number;
          saves_count: number;
          comments_count: number;
          tags: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          source?: 'ai' | 'user';
          title: string;
          title_en?: string | null;
          cook_time?: string | null;
          difficulty?: string | null;
          servings?: string | null;
          ingredients?: import('./index').RecipeIngredient[] | null;
          steps?: import('./index').RecipeStep[] | null;
          tip?: string | null;
          cover_url?: string | null;
          is_public?: boolean;
          tags?: string[];
        };
        Update: {
          title?: string;
          title_en?: string | null;
          cook_time?: string | null;
          difficulty?: string | null;
          servings?: string | null;
          ingredients?: import('./index').RecipeIngredient[] | null;
          steps?: import('./index').RecipeStep[] | null;
          tip?: string | null;
          cover_url?: string | null;
          is_public?: boolean;
          tags?: string[];
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string | null;
          title: string;
          content: string | null;
          images: string[];
          tags: string[];
          likes_count: number;
          saves_count: number;
          comments_count: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          recipe_id?: string | null;
          title: string;
          content?: string | null;
          images?: string[];
          tags?: string[];
        };
        Update: {
          title?: string;
          content?: string | null;
          images?: string[];
          tags?: string[];
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          target_type: 'recipe' | 'post';
          target_id: string;
          parent_id: string | null;
          content: string;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          target_type: 'recipe' | 'post';
          target_id: string;
          parent_id?: string | null;
          content: string;
        };
        Update: never;
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          target_type: 'recipe' | 'post' | 'comment';
          target_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          target_type: 'recipe' | 'post' | 'comment';
          target_id: string;
        };
        Update: never;
      };
      saves: {
        Row: {
          id: string;
          user_id: string;
          target_type: 'recipe' | 'post';
          target_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          target_type: 'recipe' | 'post';
          target_id: string;
        };
        Update: never;
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
        };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          type: 'like' | 'comment' | 'follow' | 'reply';
          target_type: string | null;
          target_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          actor_id?: string | null;
          type: 'like' | 'comment' | 'follow' | 'reply';
          target_type?: string | null;
          target_id?: string | null;
        };
        Update: {
          is_read?: boolean;
        };
      };
      tags: {
        Row: {
          name: string;
          post_count: number;
          updated_at: string;
        };
        Insert: { name: string };
        Update: { post_count?: number };
      };
    };
  };
}
