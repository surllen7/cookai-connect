import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'CookAI Connect <noreply@mail.yourdomain.com>';

serve(async (req) => {
  try {
    const payload = await req.json();
    // Supabase Auth Webhook payload: { type: 'INSERT', table: 'users', record: { email, ... } }
    const email: string = payload?.record?.email ?? payload?.email;
    if (!email) return new Response('no email', { status: 400 });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: '欢迎加入 CookAI Connect 🥑',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#FDFBF7;">
            <div style="text-align:center;margin-bottom:28px;">
              <div style="display:inline-flex;width:72px;height:72px;border-radius:24px;background:linear-gradient(135deg,#9ED05B,#A8DC64);align-items:center;justify-content:center;font-size:36px;">🥑</div>
              <h1 style="margin:16px 0 4px;font-size:22px;color:#1e293b;">欢迎来到 <span style="color:#84B741;">CookAI Connect</span></h1>
              <p style="color:#94a3b8;font-size:14px;margin:0;">用 AI 发现专属你的美味菜谱</p>
            </div>

            <div style="background:#F2F8EB;border-radius:16px;padding:20px 24px;margin-bottom:24px;">
              <p style="color:#3f6212;font-size:15px;margin:0 0 12px;font-weight:600;">你已成功注册 🎉</p>
              <p style="color:#4b7c0e;font-size:14px;margin:0;line-height:1.6;">
                现在你可以：<br>
                ✨ 让 AI 根据食材为你生成专属菜谱<br>
                📖 浏览社区里其他美食爱好者的精彩分享<br>
                ❤️ 收藏你喜欢的菜谱，随时查看
              </p>
            </div>

            <div style="text-align:center;margin-bottom:28px;">
              <a href="${Deno.env.get('APP_URL') ?? 'https://cookai.app'}"
                 style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#9ED05B,#A8DC64);color:#fff;font-weight:700;font-size:15px;border-radius:99px;text-decoration:none;">
                开始探索菜谱 →
              </a>
            </div>

            <p style="color:#cbd5e1;font-size:12px;text-align:center;margin:0;">
              你收到此邮件是因为此邮箱已在 CookAI Connect 完成注册。
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return new Response('email failed', { status: 500 });
    }

    return new Response('ok', { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response('error', { status: 500 });
  }
});
