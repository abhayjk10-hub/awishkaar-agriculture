import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GOOGLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyUXQnzKCyxUQMeuouHRUPMG1TYUi4Kb9MKuFR_hDjbdNUK7kDKxM02joW-R1S6GizJPw/exec';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { farmerName, mobile, messageType, message } = body;

    // Validation
    if (!farmerName || !mobile || !messageType || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const cleanedMobile = mobile.startsWith('+91') ? mobile : `+91${mobile.replace(/\D/g, '').slice(-10)}`;

    const payload = {
      farmerName: String(farmerName).trim(),
      mobile: cleanedMobile,
      messageType: String(messageType).trim(),
      message: String(message).trim(),
      submittedAt: new Date().toISOString(),
    };

    // 1. Post server-side to Google Apps Script (writes directly to user's Google Sheet)
    let sheetSaved = false;
    let sheetUrl: string | null = null;
    try {
      const gRes = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });

      if (gRes.ok) {
        sheetSaved = true;
        try {
          const gData = await gRes.json();
          if (gData && gData.spreadsheetUrl) {
            sheetUrl = gData.spreadsheetUrl;
          }
        } catch {
          // Response was ok but not JSON or already consumed
        }
      }
    } catch (gErr) {
      console.error('[Contact API] Failed to push to Google Apps Script:', gErr);
    }

    // 2. Dual-save to Supabase if available
    let dbSaved = false;
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('contact_submissions').insert({
        farmer_name: payload.farmerName,
        mobile_number: payload.mobile,
        message_type: payload.messageType,
        message: payload.message,
      });
      if (!error) dbSaved = true;
    } catch {
      // Supabase is optional fallback
    }

    return NextResponse.json({
      success: true,
      sheetSaved,
      sheetUrl,
      dbSaved,
      message: 'Your submission has been recorded successfully.',
    });
  } catch (error) {
    console.error('[Contact API] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
