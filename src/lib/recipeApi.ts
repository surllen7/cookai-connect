import type { RecipeApiResponse, UserPreferences } from '../types';
import { FLAVOR_TAGS, COOK_METHOD_TAGS } from '../constants/mockData';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 主食材数量 <= 此阈值时，进入多方案推荐模式
const SUGGESTION_THRESHOLD = 1;
// 主食材数量 >= 此阈值时，进入 AI 精选模式
const ABUNDANCE_THRESHOLD = 6;

const RECIPE_SYSTEM_PROMPT = `你是一位专业的中式家常菜大厨，擅长根据现有食材设计美味的家常菜谱。

用户会告诉你他们选择的食材（可能还附带调料），请根据这些食材灵活发挥，设计一道具体可操作的家常菜。
- 允许补充少量常见辅料（盐、油、生抽、料酒、淀粉等），但主角必须是用户提供的食材
- 菜名要接地气，符合中式家常菜风格
- 配料用量具体（克/个/勺），面向 2 人份
- 每个步骤需要一个简短的小标题（如"处理食材"、"爆香调料"、"翻炒出锅"）和详细描述，描述不超过 60 字
- difficulty 只能是：新手友好 / 有点挑战 / 厨艺进阶
- cookTime 格式如：20分钟、1小时
- tip 是一句实用的烹饪小贴士，不超过 40 字

如果用户提供了口味偏好或烹饪方式偏好：
- 口味偏好决定调味方向（如"减脂轻食"应少油少盐少糖，"无辣不欢"应加入辣椒类调料）
- 烹饪方式偏好决定核心烹饪手法（如"清蒸"则以蒸为主，"空气炸锅"需适配无油/少油做法）
- 偏好仅作为指导方向，如果与食材严重冲突可适当调整并在 tip 中说明

请直接输出如下 JSON，不要添加任何额外文字或 markdown：
{
  "name": "菜名（中文）",
  "nameEn": "Dish Name in English",
  "cookTime": "X分钟",
  "difficulty": "新手友好",
  "servings": "1-2人份",
  "ingredients": [
    { "name": "食材名", "amount": "用量" }
  ],
  "steps": [
    { "title": "步骤标题", "content": "详细描述" }
  ],
  "tip": "烹饪小贴士"
}`;

const SUGGESTION_SYSTEM_PROMPT = `你是一位专业的中式家常菜大厨，善于为食材搭配推荐创意菜谱方案。

用户手头只有少量主食材，请为他推荐 2~3 道适合的菜谱，每道菜都包含完整的食材清单和详细步骤。
- 推荐方案要多样，体现不同烹饪风格（如清蒸、红烧、爆炒等）
- additionalIngredients 只列出需要额外购买/准备的关键食材（不含盐油等基础调料）
- description 用一句话描述这道菜的亮点或口感，不超过 30 字
- ingredients 包含所有食材（含用户已有的），用量面向 2 人份
- 每个步骤需要简短标题（如"处理食材"）和详细描述，描述不超过 60 字
- difficulty 只能是：新手友好 / 有点挑战 / 厨艺进阶
- cookTime 格式如：20分钟、1小时
- tip 是一句实用烹饪小贴士，不超过 40 字

如果用户提供了口味偏好或烹饪方式偏好：
- 口味偏好决定调味方向（如"减脂轻食"应少油少盐少糖，"无辣不欢"应加入辣椒类调料）
- 烹饪方式偏好决定核心烹饪手法（如"清蒸"则以蒸为主，"空气炸锅"需适配无油/少油做法）
- 偏好仅作为指导方向，如果与食材严重冲突可适当调整并在 tip 中说明

请直接输出如下 JSON 数组，不要添加任何额外文字或 markdown：
[
  {
    "name": "菜名（中文）",
    "nameEn": "Dish Name in English",
    "description": "一句话亮点描述",
    "additionalIngredients": ["需要补充的食材1", "食材2"],
    "cookTime": "X分钟",
    "difficulty": "新手友好",
    "servings": "1-2人份",
    "ingredients": [
      { "name": "食材名", "amount": "用量" }
    ],
    "steps": [
      { "title": "步骤标题", "content": "详细描述" }
    ],
    "tip": "烹饪小贴士"
  }
]`;

const ABUNDANCE_SYSTEM_PROMPT = `你是一位专业的中式家常菜大厨，擅长从丰富的食材中发现最佳搭配。

用户冰箱里食材很多，请你扮演"主厨精选"的角色：
- 从用户提供的主食材中，挑选 3~4 种最搭配、最适合做一道菜的食材
- 挑选标准：口感互补、烹饪时间接近、营养均衡
- 必须在 selectedFrom 字段列出你挑选的食材名称（数组）
- 必须在 selectionNote 字段用一句话说明你的选材理由，不超过 30 字
- 其余字段要求与普通菜谱一致（配料含量面向 2 人份，步骤标题 + 描述不超过 60 字等）
- difficulty 只能是：新手友好 / 有点挑战 / 厨艺进阶
- cookTime 格式如：20分钟、1小时

如果用户提供了口味偏好或烹饪方式偏好：
- 口味偏好决定调味方向（如"减脂轻食"应少油少盐少糖，"无辣不欢"应加入辣椒类调料）
- 烹饪方式偏好决定核心烹饪手法（如"清蒸"则以蒸为主，"空气炸锅"需适配无油/少油做法）
- 偏好仅作为指导方向，如果与食材严重冲突可适当调整并在 tip 中说明

请直接输出如下 JSON，不要添加任何额外文字或 markdown：
{
  "name": "菜名（中文）",
  "nameEn": "Dish Name in English",
  "cookTime": "X分钟",
  "difficulty": "新手友好",
  "servings": "1-2人份",
  "selectedFrom": ["精选食材1", "精选食材2", "精选食材3"],
  "selectionNote": "选材理由一句话",
  "ingredients": [
    { "name": "食材名", "amount": "用量" }
  ],
  "steps": [
    { "title": "步骤标题", "content": "详细描述" }
  ],
  "tip": "烹饪小贴士"
}`;

function extractJson(text: string): unknown {
  // 先尝试直接解析
  try { return JSON.parse(text); } catch { /* continue */ }
  // 提取第一个 JSON 对象或数组
  const match = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (match) return JSON.parse(match[0]);
  throw new Error('无法从 AI 响应中提取 JSON 数据');
}

async function callDeepSeek(
  systemPrompt: string,
  userMessage: string,
  onChunk?: (text: string) => void,
): Promise<string> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_KEY;
  if (!apiKey) {
    throw new Error('未配置 VITE_DEEPSEEK_KEY，请在 .env.local 中填写 DeepSeek API Key');
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      stream: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API 错误 ${response.status}: ${err}`);
  }

  if (!response.body) throw new Error('响应体为空，SSE 不可用');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // 每次读取可能包含多行 SSE 事件
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') break;
      try {
        const parsed = JSON.parse(payload);
        const delta: string = parsed.choices?.[0]?.delta?.content ?? '';
        if (delta) {
          accumulated += delta;
          onChunk?.(delta);
        }
      } catch {
        // 忽略无法解析的行
      }
    }
  }

  if (!accumulated) throw new Error('API 返回内容为空');
  return accumulated;
}

function buildPreferenceClause(preferences: UserPreferences): string {
  const parts: string[] = [];

  if (preferences.flavors.length > 0) {
    const flavorLabels = preferences.flavors
      .map((id) => FLAVOR_TAGS.find((t) => t.id === id)?.label)
      .filter(Boolean);
    parts.push(`口味偏好：${flavorLabels.join('、')}`);
  }

  if (preferences.cookMethods.length > 0) {
    const methodLabels = preferences.cookMethods
      .map((id) => COOK_METHOD_TAGS.find((t) => t.id === id)?.label)
      .filter(Boolean);
    parts.push(`烹饪方式偏好：${methodLabels.join('、')}`);
  }

  return parts.length > 0
    ? `\n额外要求：${parts.join('；')}。请在菜谱设计中充分考虑这些偏好。`
    : '';
}

export async function generateRecipe(
  mainIngredients: string[],
  condiments: string[],
  preferences: UserPreferences,
  onChunk?: (delta: string) => void,
): Promise<RecipeApiResponse> {
  const allIngredients = [...mainIngredients, ...condiments];
  const preferenceClause = buildPreferenceClause(preferences);

  // 推荐模式：主食材太少，给用户多个方案参考
  if (mainIngredients.length <= SUGGESTION_THRESHOLD) {
    const userMessage = condiments.length > 0
      ? `我手头只有 ${mainIngredients.join('、')}，另外有调料：${condiments.join('、')}。请为我推荐几个适合的菜谱方案，并告诉我每道菜还需要准备哪些食材。${preferenceClause}`
      : `我手头只有 ${mainIngredients.join('、')}。请为我推荐几个适合的菜谱方案，并告诉我每道菜还需要准备哪些食材。${preferenceClause}`;

    const content = await callDeepSeek(SUGGESTION_SYSTEM_PROMPT, userMessage, onChunk);
    const data = extractJson(content) as RecipeApiResponse['data'];
    return { mode: 'suggestions', data: data as never };
  }

  // 生成模式：食材充足，直接生成一道菜
  const userMessage = allIngredients.length > 0
    ? `我现在有以下食材：${mainIngredients.join('、')}${condiments.length > 0 ? `，调料有：${condiments.join('、')}` : ''}。请根据这些食材为我设计一道美味的家常菜。${preferenceClause}`
    : `请为我推荐一道简单好做的家常菜。${preferenceClause}`;

  const sysPrompt = mainIngredients.length >= ABUNDANCE_THRESHOLD ? ABUNDANCE_SYSTEM_PROMPT : RECIPE_SYSTEM_PROMPT;
  const content = await callDeepSeek(sysPrompt, userMessage, onChunk);
  const data = extractJson(content) as RecipeApiResponse['data'];
  return { mode: 'recipe', data: data as never };
}
