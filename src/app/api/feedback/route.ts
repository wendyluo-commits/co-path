import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rate-limit';

const FeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  spread: z.string().max(50).optional(),
  improvementAreas: z.string().max(500).optional(),
  // Optional client-side identifier — lets us correlate emails to
  // localStorage entries without leaking PII.
  readingId: z.string().max(64).optional(),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderEmail(d: z.infer<typeof FeedbackSchema>): { subject: string; html: string; text: string } {
  const stars = '★'.repeat(d.rating) + '☆'.repeat(5 - d.rating);
  const subject = `[Tarot Feedback] ${stars} ${d.spread || 'unknown'}`;

  const rows: Array<[string, string]> = [
    ['Rating', `${d.rating} / 5  ${stars}`],
    ['Spread', d.spread || '—'],
    ['Reading ID', d.readingId || '—'],
    ['Improvement Areas', d.improvementAreas || '—'],
    ['Comment', d.comment || '—'],
    ['Submitted At', new Date().toISOString()],
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  const html =
    '<table style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;border-collapse:collapse">' +
    rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px;color:#666;vertical-align:top">${escapeHtml(k)}</td>` +
          `<td style="padding:6px 12px;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`
      )
      .join('') +
    '</table>';

  return { subject, html, text };
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'feedback', 10, 60_000);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: parsed.error.errors },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FEEDBACK_EMAIL_TO;
  const from = process.env.FEEDBACK_EMAIL_FROM || 'feedback@resend.dev';

  // If Resend isn't configured, accept the feedback so the client UX is the
  // same. We log a warning — and the client has the data in localStorage as a
  // backup the user could send manually if asked.
  if (!apiKey || !to) {
    console.warn('[feedback] RESEND_API_KEY / FEEDBACK_EMAIL_TO not set — accepting feedback without remote write');
    return NextResponse.json({ ok: true, stored: 'local-only' });
  }

  try {
    const { subject, html, text } = renderEmail(parsed.data);
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend send failed:', error);
      // Still return ok — the user shouldn't see an error for our backend hiccup.
      return NextResponse.json({ ok: true, stored: 'local-only', warning: 'remote_failed' });
    }

    return NextResponse.json({ ok: true, stored: 'email', id: data?.id });
  } catch (e) {
    console.error('Feedback route error:', e);
    return NextResponse.json({ ok: true, stored: 'local-only', warning: 'remote_error' });
  }
}
