import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, X, Check, Plus, Send, Image } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import type { Recipe } from '../types';

const PRESET_TAGS = ['#今日晚餐', '#打工人带饭', '#新手零失败', '#减脂餐', '#家常菜', '#快手菜', '#下饭神器', '#周末厨房'];

// 多图上传（纯内容贴，最多 9 张）
function MultiImageUploader({
  previews,
  onAdd,
  onRemove,
}: {
  previews: string[];
  onAdd: (files: FileList) => void;
  onRemove: (i: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canAdd = previews.length < 9;

  return (
    <div>
      <p className="text-xs font-bold text-slate-500 mb-2">
        添加图片（最多 9 张）
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onAdd(e.target.files)}
      />
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-100">
            <img src={src} className="w-full h-full object-cover" />
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        {canAdd && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-1 text-slate-400 active:bg-slate-50 transition-colors"
          >
            <Camera size={22} />
            <span className="text-[10px]">添加图片</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function PublishPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const recipeId: string | undefined = state?.recipeId;
  const recipe: Recipe | undefined = state?.recipe;
  const isRecipePost = !!recipe;          // true = 菜谱贴，false = 纯内容贴
  const { user } = useAuthContext();

  const [title, setTitle] = useState(recipe?.name ?? '');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  // 菜谱贴：单封面 + 步骤图
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [stepImages, setStepImages] = useState<(File | null)[]>(
    () => new Array(recipe?.steps.length ?? 0).fill(null)
  );
  const [stepPreviews, setStepPreviews] = useState<string[]>(
    () => new Array(recipe?.steps.length ?? 0).fill('')
  );
  const coverInputRef = useRef<HTMLInputElement>(null);
  const stepInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 纯内容贴：多图
  const [postFiles, setPostFiles] = useState<File[]>([]);
  const [postPreviews, setPostPreviews] = useState<string[]>([]);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleStepImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStepImages((prev) => { const next = [...prev]; next[index] = file; return next; });
    setStepPreviews((prev) => { const next = [...prev]; next[index] = URL.createObjectURL(file); return next; });
  };

  const removeStepImage = (index: number) => {
    setStepImages((prev) => { const next = [...prev]; next[index] = null; return next; });
    setStepPreviews((prev) => { const next = [...prev]; next[index] = ''; return next; });
  };

  const handleAddPostImages = (files: FileList) => {
    const remaining = 9 - postFiles.length;
    const newFiles = Array.from(files).slice(0, remaining);
    setPostFiles((prev) => [...prev, ...newFiles]);
    setPostPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  };

  const removePostImage = (i: number) => {
    setPostFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPostPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const uploadFile = async (file: File, path: string, bucket = 'recipe-covers'): Promise<string | null> => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) return null;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  const handlePublish = async () => {
    if (!user) return;
    if (!title.trim()) { setError('请填写标题'); return; }
    setPublishing(true);
    setError('');

    try {
      if (isRecipePost && recipeId) {
        // ── 菜谱贴 ──
        let coverUrl: string | null = null;
        if (coverFile) coverUrl = await uploadFile(coverFile, `${user.id}/${recipeId}/cover`);

        // 步骤图
        const steps = recipe!.steps;
        const hasStepImages = stepImages.some(Boolean);
        let updatedSteps = steps;
        if (hasStepImages) {
          const stepUrls = await Promise.all(
            stepImages.map(async (file, i) => {
              if (!file) return steps[i]?.imageUrl ?? null;
              return uploadFile(file, `${user.id}/${recipeId}/step_${i}`);
            })
          );
          updatedSteps = steps.map((step, i) => ({ ...step, imageUrl: stepUrls[i] ?? undefined }));
        }

        const recipeUpdate: Record<string, unknown> = { is_public: true, steps: updatedSteps };
        if (coverUrl) recipeUpdate.cover_url = coverUrl;
        const { error: re } = await supabase.from('recipes').update(recipeUpdate).eq('id', recipeId);
        if (re) throw re;

        const { error: pe } = await supabase.from('posts').insert({
          user_id: user.id,
          recipe_id: recipeId,
          title: title.trim(),
          content: content.trim() || null,
          images: coverUrl ? [coverUrl] : [],
          tags: selectedTags,
        });
        if (pe) throw pe;
      } else {
        // ── 纯内容贴 ──
        const postId = crypto.randomUUID();
        const uploadedUrls = await Promise.all(
          postFiles.map((file, i) => uploadFile(file, `${user.id}/${postId}/img_${i}`, 'post-images'))
        );
        const images = uploadedUrls.filter(Boolean) as string[];

        const { error: pe } = await supabase.from('posts').insert({
          user_id: user.id,
          recipe_id: null,
          title: title.trim(),
          content: content.trim() || null,
          images,
          tags: selectedTags,
        });
        if (pe) throw pe;
      }

      navigate('/community', { replace: true });
    } catch (e) {
      setError((e as { message?: string }).message ?? '发布失败，请重试');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FDFBF7]">
      {/* 顶部导航 */}
      <header className="flex items-center justify-between px-4 pt-12 pb-4 bg-white border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-slate-600">
          <ArrowLeft size={22} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-slate-800 text-base">
            {isRecipePost ? '发布菜谱' : '发布笔记'}
          </h1>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
            isRecipePost ? 'bg-[#F4F9EE] text-[#84B741]' : 'bg-blue-50 text-blue-400'
          }`}>
            {isRecipePost ? '🍳 菜谱贴' : '📝 分享贴'}
          </span>
        </div>
        <button
          onClick={handlePublish}
          disabled={publishing || !title.trim()}
          className="flex items-center gap-1.5 bg-[#84B741] text-white text-sm font-bold px-4 py-2 rounded-full disabled:opacity-50 active:scale-95 transition-all"
        >
          {publishing ? (
            <span className="flex gap-1">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </span>
          ) : (
            <><Send size={14} /> 发布</>
          )}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar px-5 pt-5 pb-10 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {/* ── 纯内容贴：多图上传 ── */}
        {!isRecipePost && (
          <MultiImageUploader
            previews={postPreviews}
            onAdd={handleAddPostImages}
            onRemove={removePostImage}
          />
        )}

        {/* ── 菜谱贴：单封面图 ── */}
        {isRecipePost && (
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">封面图片</p>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            {coverPreview ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden">
                <img src={coverPreview} alt="封面" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setCoverFile(null); setCoverPreview(''); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="w-full h-44 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center gap-2 text-slate-400 active:bg-slate-50 transition-colors"
              >
                <Camera size={28} />
                <span className="text-sm">点击上传封面图</span>
                <span className="text-xs text-slate-300">建议比例 4:3</span>
              </button>
            )}
          </div>
        )}

        {/* 标题 */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">
            标题 <span className="text-red-400">*</span>
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={30}
            placeholder={isRecipePost ? '为你的菜谱起个标题...' : '写下你想分享的标题...'}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-[#84B741] transition-colors"
          />
          <p className="text-right text-xs text-slate-300 mt-1">{title.length}/30</p>
        </div>

        {/* 正文 */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">
            {isRecipePost ? '分享心得（可选）' : '内容（可选）'}
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder={
              isRecipePost
                ? '分享一下制作心得、翻车经历或小技巧...'
                : '聊聊你的美食故事、推荐理由或者翻车经历...'
            }
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-[#84B741] transition-colors resize-none"
          />
          <p className="text-right text-xs text-slate-300 mt-1">{content.length}/500</p>
        </div>

        {/* 标签 */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">添加标签（最多 5 个）</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                    selected
                      ? 'bg-[#84B741] text-white border-[#84B741]'
                      : 'bg-white text-slate-500 border-slate-200'
                  }`}
                >
                  {selected && <Check size={10} className="inline mr-1" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* 步骤图片（仅菜谱贴） */}
        {isRecipePost && recipe!.steps.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-500 mb-1">步骤图片（可选）</p>
            <p className="text-xs text-slate-400 mb-3">为每个步骤添加参考图，让菜谱更直观</p>
            <div className="space-y-3">
              {recipe!.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 bg-white rounded-2xl p-3 border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-[#84B741] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 mb-0.5 truncate">{step.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{step.content}</p>
                  </div>
                  <input
                    ref={(el) => { stepInputRefs.current[i] = el; }}
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleStepImageChange(i, e)}
                  />
                  {stepPreviews[i] ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                      <img src={stepPreviews[i]} alt={`步骤${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeStepImage(i)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => stepInputRefs.current[i]?.click()}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 shrink-0 active:bg-slate-50 transition-colors"
                    >
                      <Image size={16} />
                      <span className="text-[9px] mt-0.5">添加图</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 关联菜谱预览（仅菜谱贴） */}
        {isRecipePost && (
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">关联菜谱</p>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#F4F9EE] flex items-center justify-center text-2xl shrink-0">🍳</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">{recipe!.name}</p>
                <p className="text-xs text-slate-400">{recipe!.cookTime} · {recipe!.difficulty}</p>
              </div>
              <div className="flex items-center gap-1 bg-[#F4F9EE] px-2.5 py-1 rounded-full">
                <Plus size={10} className="text-[#84B741]" />
                <span className="text-xs text-[#84B741] font-semibold">已关联</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
