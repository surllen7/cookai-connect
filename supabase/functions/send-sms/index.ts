/**
 * Supabase Auth Hook - Send SMS（短信宝版本）
 * 在 Supabase Dashboard → Authentication → Hooks → Send SMS Hook 中配置此函数 URL
 *
 * 注册地址：https://www.smsbao.com （个人身份证实名即可，无需企业资质）
 *
 * 所需 Secrets（Edge Functions → send-sms → Secrets）：
 *   SMSBAO_USERNAME   短信宝账号（注册手机号）
 *   SMSBAO_PASSWORD   短信宝密码的 MD5 值
 *   SMSBAO_SIGN       短信签名，如 CookAI（显示为【CookAI】，需在控制台申请）
 *
 * 计算 MD5 密码（任选一种）：
 *   终端：echo -n "你的密码" | md5sum
 *   在线：https://www.cmd5.com
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

// 短信宝返回状态码说明
const STATUS_MSG: Record<string, string> = {
  '0':  '发送成功',
  '30': '密码错误',
  '40': '账号不存在',
  '41': '余额不足',
  '42': '账号过期',
  '43': 'IP 受限',
  '50': '内容含敏感词',
  '51': '手机号格式错误',
};

async function sendSmsBao(phone: string, code: string): Promise<{ ok: boolean; msg: string }> {
  const username = Deno.env.get('SMSBAO_USERNAME')!;
  const password = Deno.env.get('SMSBAO_PASSWORD')!; // MD5 后的值
  const sign     = Deno.env.get('SMSBAO_SIGN') ?? 'CookAI';

  // 短信宝只接受纯数字手机号（去掉 +86 前缀）
  const phoneClean = phone.replace(/^\+86/, '').replace(/\D/g, '');
  const content    = `【${sign}】您的验证码是${code}，5分钟内有效，请勿告知他人。`;

  const params = new URLSearchParams({ u: username, p: password, m: phoneClean, c: content });
  const res    = await fetch(`https://api.smsbao.com/sms?${params}`);
  const code_  = (await res.text()).trim();

  return { ok: code_ === '0', msg: STATUS_MSG[code_] ?? `未知错误码: ${code_}` };
}

// ── Hook 入口 ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let payload: { user?: { phone?: string }; phone?: string; otp?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const phone = payload.user?.phone ?? payload.phone ?? '';
  const otp   = payload.otp ?? '';

  if (!phone || !otp) {
    return new Response(JSON.stringify({ error: 'Missing phone or otp' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { ok, msg } = await sendSmsBao(phone, otp);

  if (!ok) {
    console.error(`[send-sms] 短信宝发送失败: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`[send-sms] 发送成功 → ${phone.slice(0, 3)}****${phone.slice(-4)}`);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
