import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JSDOM } from 'jsdom';

const iconCache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletIconId = searchParams.get('id');

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { data: authData } = await supabase.auth.getUser()

    if (!authData?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (!walletIconId) {
      return NextResponse.json(
        { error: 'Wallet icon ID is required' },
        { status: 400 }
      );
    }

    const cached = iconCache.get(walletIconId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        iconBase64: cached.data,
        walletIconId,
        cached: true
      });
    }

    const spriteUrl = "https://iconic.dynamic-static-assets.com/icons/sprite.svg";
    const response = await fetch(spriteUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch sprite' },
        { status: 500 }
      );
    }

    const svgText = await response.text();
    
    const dom = new JSDOM(svgText, { 
      contentType: 'image/svg+xml',
      pretendToBeVisual: false,
      resources: 'usable'
    });
    
    const document = dom.window.document;
    const iconElement = document.getElementById(walletIconId);
    
    if (!iconElement) {
      return NextResponse.json(
        { error: `Icon '${walletIconId}' not found in sprite` },
        { status: 404 }
      );
    }

    let svgString = '';
    
    if (iconElement.tagName.toLowerCase() === 'symbol') {
      const viewBox = iconElement.getAttribute('viewBox') || '0 0 24 24';
      const innerHTML = iconElement.innerHTML;
      
      svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="24" height="24">${innerHTML}</svg>`;
    } else {
      svgString = iconElement.outerHTML;
    }
    
    const base64 = Buffer.from(svgString).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64}`;
    
    iconCache.set(walletIconId, {
      data: dataUrl,
      timestamp: Date.now()
    });

    return NextResponse.json({
      iconBase64: dataUrl,
      walletIconId,
      cached: false
    });

  } catch (error) {
    console.error('Error fetching wallet icon:', error);
    
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}