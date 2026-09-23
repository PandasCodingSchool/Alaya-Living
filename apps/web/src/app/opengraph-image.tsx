import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Alaya — Find a compatible roommate in Bengaluru';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #14080E 0%, #3a1024 55%, #F43F7A 140%)',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.7 }}>
          Alaya · Bengaluru
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
            Share the rent with someone you can actually live with.
          </div>
          <div style={{ fontSize: 28, opacity: 0.75, maxWidth: 820 }}>
            Match on budget, corridor and lifestyle. Chat only after both people say yes.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
