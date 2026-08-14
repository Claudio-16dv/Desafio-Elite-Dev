'use client';

import { QRCodeCanvas } from 'qrcode.react';

export function QrView({ qrToken, size = 220 }: { qrToken: string; size?: number }) {
  return (
    <div
      className="inline-flex rounded-[--radius] bg-white p-3 shadow-lg shadow-black/20"
      aria-label="Código QR do ingresso"
    >
      <QRCodeCanvas value={qrToken} size={size} includeMargin />
    </div>
  );
}
