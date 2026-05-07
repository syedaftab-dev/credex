import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const savings = searchParams.get('savings') || '0';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            fontFamily: 'sans-serif',
            border: '20px solid #121212',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
              backgroundColor: '#ccff00',
              padding: '10px 20px',
              border: '4px solid black',
              borderRadius: '10px',
              fontWeight: '900',
              fontSize: 24,
              textTransform: 'uppercase',
            }}
          >
            CredX Audit
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 60,
                fontWeight: 900,
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Potentially Saving
            </div>
            <div
              style={{
                fontSize: 160,
                fontWeight: 900,
                fontStyle: 'italic',
                lineHeight: 1,
                color: '#a855f7',
                marginBottom: 20,
              }}
            >
              ${parseInt(savings).toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 40,
                fontWeight: 900,
                textTransform: 'uppercase',
                opacity: 0.6,
              }}
            >
              Per Year on AI Tools
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              fontSize: 24,
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            credex.com/audit
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
