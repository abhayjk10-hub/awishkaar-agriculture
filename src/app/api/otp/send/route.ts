import { NextResponse } from 'next/server';
import { storeOtp, generateOtpCode } from '@/lib/otp';

const isValidIndianMobile = (value: string) => /^[6-9]\d{9}$/.test(value.trim());

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone || '').trim();

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Mobile number is required.' }, { status: 400 });
    }

    const normalized = phone.replace(/^\+91/, '');
    if (!isValidIndianMobile(normalized)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' }, { status: 400 });
    }

    const code = generateOtpCode();
    storeOtp(normalized, code);

    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      const encoded = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encoded}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: `+91${normalized}`,
          Body: `Your Kisan Mitra OTP is ${code}. Valid for 5 minutes.`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({
          success: false,
          message: `SMS sending failed: ${errorText}`,
        }, { status: 502 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully. Please check your mobile number.',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP.',
    }, { status: 500 });
  }
}
