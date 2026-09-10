'use client';

import { useCallback } from 'react';
import { Clock, MapPin, X } from 'lucide-react';
import { useToken, type TokenStatus } from '@/contexts/TokenContext';

function getStatusLabel(status: TokenStatus, ahead: number): string {
  if (status === 'now') return '🚨 YOUR TURN NOW — Please proceed to the mandi!';
  if (status === 'approaching') return `⚡ Almost there — ${ahead} token${ahead === 1 ? '' : 's'} ahead of you`;
  return `${ahead} token${ahead === 1 ? '' : 's'} ahead`;
}

function getStatusColor(status: TokenStatus): string {
  if (status === 'now') return 'token-marquee--now';
  if (status === 'approaching') return 'token-marquee--approaching';
  return 'token-marquee--waiting';
}

export default function TokenMarquee() {
  const { token, clearToken } = useToken();

  const handleDismiss = useCallback(() => {
    if (token?.status === 'now' || token?.status === 'approaching') {
      if (!window.confirm('Are you sure you want to dismiss your token tracking? You may miss your slot.')) return;
    }
    clearToken();
  }, [token, clearToken]);

  if (!token) return null;

  const statusLabel = getStatusLabel(token.status, token.totalAhead);
  const colorClass = getStatusColor(token.status);

  return (
    <div
      className={`token-marquee ${colorClass}`}
      role="status"
      aria-live="polite"
      aria-label={`Token tracking: ${statusLabel}`}
    >
      <div className="token-marquee-inner">
        {/* Token number */}
        <div className="token-marquee-token">
          <span className="token-marquee-label">YOUR TOKEN</span>
          <strong className="token-marquee-number">#{token.tokenNumber}</strong>
        </div>

        <div className="token-marquee-divider" aria-hidden="true" />

        {/* Mandi */}
        <div className="token-marquee-info">
          <MapPin />
          <span>{token.mandiName}</span>
        </div>

        <div className="token-marquee-divider" aria-hidden="true" />

        {/* Slot time */}
        <div className="token-marquee-info">
          <Clock />
          <span>Slot: {token.slotTime}</span>
        </div>

        <div className="token-marquee-divider" aria-hidden="true" />

        {/* Status — scrolling on mobile */}
        <div className="token-marquee-status">
          <span className="token-marquee-pulse" aria-hidden="true" />
          <span>{statusLabel}</span>
        </div>

        {/* Wait estimate */}
        {token.status !== 'now' && token.estimatedWaitMinutes > 0 && (
          <>
            <div className="token-marquee-divider" aria-hidden="true" />
            <div className="token-marquee-wait">
              ~{token.estimatedWaitMinutes} min wait
            </div>
          </>
        )}

        {/* Dismiss */}
        <button
          type="button"
          className="token-marquee-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss token tracking"
          title="Dismiss"
        >
          <X />
        </button>
      </div>
    </div>
  );
}
