import type { RenderContext } from '../../types.js';
import { label } from '../colors.js';
import { t } from '../../i18n/index.js';

const ADVISOR_ID_PATTERN = /^(?:claude-)?(opus|sonnet|haiku)-(\d+)-(\d+)/i;

/**
 * Prettifies a raw advisor model ID (as captured from the transcript) into a
 * human-friendly label. Falls back to the input string when the pattern is
 * not recognised.
 *
 *   claude-opus-4-7              → Opus 4.7
 *   claude-sonnet-4-6            → Sonnet 4.6
 *   claude-haiku-4-5-20251001    → Haiku 4.5
 *   opus                         → Opus
 */
export function prettifyAdvisorId(rawId: string): string {
  const id = rawId.trim();
  if (!id) {
    return '';
  }

  const match = id.match(ADVISOR_ID_PATTERN);
  if (match) {
    const family = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    return `${family} ${match[2]}.${match[3]}`;
  }

  // Short alias fallbacks (e.g. settings.json stores `"opus"`, `"sonnet"`).
  const lower = id.toLowerCase();
  if (lower === 'opus' || lower === 'sonnet' || lower === 'haiku') {
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  return id.replace(/^claude-/i, '');
}

export function renderAdvisorLine(ctx: RenderContext): string | null {
  const display = ctx.config?.display;
  if (display?.showAdvisor !== true) {
    return null;
  }

  const override = typeof display.advisorOverride === 'string'
    ? display.advisorOverride.trim()
    : '';
  const transcriptValue = ctx.transcript?.advisorModel?.trim() ?? '';

  const rawValue = override.length > 0 ? override : transcriptValue;
  if (!rawValue) {
    return null;
  }

  const pretty = override.length > 0 ? rawValue : prettifyAdvisorId(rawValue);
  if (!pretty) {
    return null;
  }

  const colors = ctx.config?.colors;
  return `${label(`${t('label.advisor')}:`, colors)} ${pretty}`;
}
