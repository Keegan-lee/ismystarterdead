import React from 'react';
import { ImageResponse } from 'next/og';

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

type TOgTemplateProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export function createOgImage({ title, subtitle, eyebrow }: TOgTemplateProps): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #F6F0E5 0%, #EFE2CF 45%, #E7D4B7 100%)',
          position: 'relative',
          padding: 72,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 15% 20%, rgba(169, 112, 62, 0.18), transparent 40%), radial-gradient(circle at 85% 30%, rgba(84, 60, 43, 0.16), transparent 45%), radial-gradient(circle at 35% 85%, rgba(169, 112, 62, 0.14), transparent 40%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: 44,
            left: 56,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#2A2019',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -0.2,
          }}
        >
          <span aria-hidden="true">🫙</span>
          <span>IsMyStarterDead</span>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: 980,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {eyebrow ? (
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#6D584B',
              }}
            >
              {eyebrow}
            </div>
          ) : null}

          <div
            style={{
              fontSize: 74,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: -1.4,
              color: '#1F1712',
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.25,
                color: '#3A2C23',
                fontWeight: 600,
                maxWidth: 920,
              }}
            >
              {subtitle}
            </div>
          ) : null}

          <div
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              color: '#6D584B',
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            <span>ismystarterdead.com</span>
            <span style={{ opacity: 0.7 }}>•</span>
            <span>Fast diagnosis + discard recipes</span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 48,
            fontSize: 56,
            opacity: 0.9,
          }}
          aria-hidden="true"
        >
          🥖
        </div>
      </div>
    ),
    {
      width: OG_IMAGE_SIZE.width,
      height: OG_IMAGE_SIZE.height,
    },
  );
}

