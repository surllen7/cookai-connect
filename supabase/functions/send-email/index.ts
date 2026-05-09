/**
 * Supabase Auth Hook - Send Email（Resend 版本）
 * 在 Supabase Dashboard → Authentication → Hooks → Send Email Hook 中配置此函数 URL
 *
 * 所需 Secrets（Edge Functions → send-email → Secrets）：
 *   RESEND_API_KEY   Resend API Key（https://resend.com → API Keys → Create API Key）
 *   EMAIL_FROM       发件人地址，格式：CookAI <noreply@yourdomain.com>
 *                    ⚠️ 免费套餐未验证域名时固定用：onboarding@resend.dev
 *   SITE_URL         你的应用地址，如 https://cookai.example.com（用于构造跳转链接）
 *
 * Resend 免费套餐：3000封/月，100封/天，注册即用，无需备案
 * 注册地址：https://resend.com
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

// ── 邮件模板 ─────────────────────────────────────────────────────────────────

function signupTemplate(confirmUrl: string): { subject: string; html: string } {
  return {
    subject: '验证你的 CookAI 账号',
    html: `
<!DOCTYPE html>
<html lang="zh">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#9ED05B,#A8DC64);padding:40px 32px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🥑</div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px">CookAI Connect</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px">用 AI 发现专属你的美味菜谱</p>
    </div>
    <!-- Body -->
    <div style="padding:36px 32px">
      <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:18px;font-weight:700">欢迎加入！</h2>
      <p style="margin:0 0 28px;color:#666;font-size:14px;line-height:1.7">
        点击下方按钮完成邮箱验证，即可开始使用 AI 智能菜谱功能。
      </p>
      <div style="text-align:center;margin-bottom:28px">
        <a href="${confirmUrl}"
           style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#9ED05B,#A8DC64);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:100px;box-shadow:0 4px 16px rgba(158,208,91,0.4)">
          验证邮箱 →
        </a>
      </div>
      <p style="margin:0;color:#999;font-size:12px;line-height:1.6;text-align:center">
        链接 24 小时内有效。若非本人操作，请忽略此邮件。
      </p>
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center">
      <p style="margin:0;color:#bbb;font-size:11px">CookAI Connect · AI 智能菜谱社区</p>
    </div>
  </div>
</body>
</html>`,
  };
}

function recoveryTemplate(confirmUrl: string): { subject: string; html: string } {
  return {
    subject: '重置你的 CookAI 密码',
    html: `
<!DOCTYPE html>
<html lang="zh">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
    <div style="background:linear-gradient(135deg,#9ED05B,#A8DC64);padding:40px 32px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🔑</div>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700">重置密码</h1>
    </div>
    <div style="padding:36px 32px">
      <p style="margin:0 0 28px;color:#666;font-size:14px;line-height:1.7">
        我们收到了你的密码重置请求，点击下方按钮设置新密码。
      </p>
      <div style="text-align:center;margin-bottom:28px">
        <a href="${confirmUrl}"
           style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#9ED05B,#A8DC64);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:100px;box-shadow:0 4px 16px rgba(158,208,91,0.4)">
          重置密码 →
        </a>
      </div>
      <p style="margin:0;color:#999;font-size:12px;text-align:center">链接 1 小时内有效。若非本人操作，请忽略。</p>
    </div>
  </div>
</body>
</html>`,
  };
}

// ── Resend 发信 ───────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY')!;
  const from   = Deno.env.get('EMAIL_FROM') ?? 'CookAI <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const data = await res.json() as { id?: string; name?: string; message?: string };

  if (!res.ok) {
    return { ok: false, error: `${data.name ?? 'Error'}: ${data.message ?? res.status}` };
  }
  return { ok: true };
}

// ── Hook 入口 ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  interface HookPayload {
    user?: { email?: string };
    email_data?: {
      token_hash?: string;
      redirect_to?: string;
      email_action_type?: string;
      site_url?: string;
    };
  }

  let payload: HookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email      = payload.user?.email ?? '';
  const tokenHash  = payload.email_data?.token_hash ?? '';
  const actionType = payload.email_data?.email_action_type ?? 'signup';
  const redirectTo = payload.email_data?.redirect_to ?? Deno.env.get('SITE_URL') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

  if (!email || !tokenHash) {
    return new Response(JSON.stringify({ error: 'Missing email or token_hash' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 构造 Supabase 验证链接
  const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${actionType}&redirect_to=${encodeURIComponent(redirectTo)}`;

  // 根据邮件类型选择模板
  const template = actionType === 'recovery'
    ? recoveryTemplate(confirmUrl)
    : signupTemplate(confirmUrl);

  const { ok, error } = await sendEmail(email, template.subject, template.html);

  if (!ok) {
    console.error(`[send-email] Resend 发送失败: ${error} → ${email}`);
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`[send-email] 发送成功 → ${email}`);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
