import { NextResponse } from 'next/server';
import { verifyOtpCode, getOtpRecord } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone || '').trim().replace(/^\+91/, '').replace(/\D/g, '').slice(-10);
    const enteredCode = String(body.code || '').trim();

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Mobile number is required.' }, { status: 400 });
    }

    if (!enteredCode) {
      return NextResponse.json({ success: false, message: 'Please enter the 6-digit OTP code.' }, { status: 400 });
    }

    // Verify against in-memory/TTL store, or master fallback '123456' for rapid dev/demo testing
    const isValid = verifyOtpCode(phone, enteredCode) || enteredCode === '123456';

    if (!isValid) {
      const record = getOtpRecord(phone);
      console.log(`[OTP Verification Failed] For: ${phone}, Entered: ${enteredCode}, Expected: ${record?.code}`);
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired OTP code. Please enter the correct code or request a new one.',
      }, { status: 400 });
    }

    console.log(`✅ [OTP Verified Successfully] For: +91${phone}`);

    // Create session user object
    const user = {
      id: 'farmer-' + phone,
      phone: '+91' + phone,
      user_metadata: {
        full_name: 'Farmer (' + phone.slice(-4) + ')',
        name: 'Farmer (' + phone.slice(-4) + ')',
      },
    };

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.',
      user,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP.',
    }, { status: 500 });
  }
}