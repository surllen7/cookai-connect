import type { IngredientsState, Post } from '../types';

export const INITIAL_INGREDIENTS: IngredientsState = {
  meat: [
    { id: 'beef', name: '牛肉', icon: '🥩', selected: true },
    { id: 'chicken', name: '鸡肉', icon: '🍗', selected: false },
    { id: 'pork', name: '猪肉', icon: '🥓', selected: false },
    { id: 'shrimp', name: '虾仁', icon: '🍤', selected: false },
    { id: 'lamb', name: '羊肉', icon: '🍖', selected: false },
  ],
  vegetable: [
    { id: 'broccoli', name: '西兰花', icon: '🥦', selected: false },
    { id: 'tomato', name: '番茄', icon: '🍅', selected: true },
    { id: 'lettuce', name: '生菜', icon: '🥬', selected: false },
    { id: 'carrot', name: '胡萝卜', icon: '🥕', selected: false },
    { id: 'mushroom', name: '香菇', icon: '🍄', selected: false },
  ],
  condiment: [
    { id: 'garlic', name: '大蒜', icon: '🧄', selected: false },
    { id: 'ginger', name: '生姜', icon: '🫚', selected: true },
    { id: 'onion', name: '葱', icon: '🧅', selected: false },
    { id: 'soy_sauce', name: '生抽', icon: '🍾', selected: false },
    { id: 'chili', name: '辣椒', icon: '🌶️', selected: false },
  ],
};

export const COMMUNITY_POSTS: Post[] = [
  {
    id: 1,
    title: '周末在家做顿好的，红烧肉yyds！',
    author: '美食课代表',
    likes: 2341,
    image: 'https://images.unsplash.com/photo-1544025162-811114bd2446?q=80&w=1000&auto=format&fit=crop',
    height: 'h-64',
  },
  {
    id: 2,
    title: '减脂期也能吃的全麦轻食餐',
    author: 'FitGirl',
    likes: 892,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop',
    height: 'h-48',
  },
  {
    id: 3,
    title: '零失败！空气炸锅版烤鸡翅',
    author: '大厨养成记',
    likes: 4500,
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?q=80&w=1000&auto=format&fit=crop',
    height: 'h-56',
  },
  {
    id: 4,
    title: '一碗治愈心灵的日式拉面',
    author: '拉面控',
    likes: 1205,
    image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1000&auto=format&fit=crop',
    height: 'h-64',
  },
];
