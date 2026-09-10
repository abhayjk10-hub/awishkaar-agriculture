import { NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/otp';

const isValidIndianMobile = (value: string) => /^[6-9]\d{9}$/.test(value.trim());

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone || '').trim();
    const otp = String(body.otp || '').trim();

    if (!phone || !otp) {
      return NextResponse.json({ success: false, message: 'Phone number and OTP are required.' }, { status: 400 });
    }

    const normalized = phone.replace(/^\+91/, '');
    if (!isValidIndianMobile(normalized)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' }, { status: 400 });
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ success: false, message: 'Invalid OTP format.' }, { status: 400 });
    }

    const valid = verifyOtpCode(normalized, otp);

    if (!valid) {
      return NextResponse.json({ success: false, message: 'Incorrect or expired OTP. Please request a new code.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'OTP verified successfully.', userId: `otp-user-${normalized}` });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP.',
    }, { status: 500 });
  }
}
