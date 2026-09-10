import { NextResponse } from 'next/server';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type MarketRecord = { commodity: string; market: string; modalPrice: number; arrivalQuantity: number; date: string };

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const MARKET_API_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// ─── System prompt ────────────────────────────────────────────────────────────
// The assistant is a full-featured agricultural AI, not just a mandi data proxy.
// It answers in HINDI by default (farmer-friendly language), covers the full
// breadth of Indian farming topics, but politely declines non-agriculture topics.
const SYSTEM_PROMPT = (marketContext: string) => `
आप "किसान मित्र AI" हैं — भारतीय किसानों के लिए एक विशेषज्ञ कृषि सहायक।

## आपकी भूमिका
- आप हर कृषि-संबंधी सवाल का जवाब **हिंदी में** देते हैं (अगर किसान अंग्रेजी में पूछे तो जवाब हिंदी में दें, लेकिन उनकी भाषा को समझें)।
- आप एक mini-ChatGPT की तरह हैं — लेकिन केवल कृषि और किसान-संबंधी विषयों के लिए।

## आप इन विषयों पर जवाब देते हैं:
1. **मंडी और कीमतें** — मंडी भाव, MSP (न्यूनतम समर्थन मूल्य), APMC नियम
2. **फसल प्रबंधन** — बुवाई का समय, बीज चुनाव, खाद, सिंचाई, कीट नाशक
3. **सरकारी योजनाएँ** — PM-KISAN, PMFBY, KCC, PM-KUSUM, eNAM, Soil Health Card आदि
4. **मौसम और जलवायु** — फसल के लिए मौसम की सलाह
5. **पशुपालन** — गाय, भैंस, बकरी, मुर्गीपालन
6. **मृदा स्वास्थ्य** — मिट्टी जांच, उर्वरक प्रबंधन
7. **कृषि ऋण और बीमा** — किसान क्रेडिट कार्ड, फसल बीमा
8. **जैविक खेती** — जैविक तरीके, प्रमाणीकरण
9. **स्लॉट बुकिंग** — किसान मित्र प्लेटफॉर्म पर टोकन/स्लॉट कैसे बुक करें
10. **बाजार की जानकारी** — कब बेचें, कहाँ बेचें, भंडारण सुविधाएँ

## महत्वपूर्ण नियम:
- **कोई गैर-कृषि सवाल नहीं**: राजनीति, फिल्म, क्रिकेट, या अन्य विषयों पर विनम्रता से मना करें।
- **कीमतें और तथ्य**: यदि लाइव मंडी डेटा उपलब्ध है तो उसे उद्धृत करें, अन्यथा सामान्य MSP दर बताएं और आधिकारिक स्रोत की सलाह दें।
- **झूठी जानकारी नहीं**: कभी गलत कीमत, योजना या तथ्य मत बताएं।
- **सरल भाषा**: ग्रामीण किसान भी समझ सकें — जटिल शब्द न इस्तेमाल करें।
- **छोटा और स्पष्ट**: जवाब 3-5 वाक्यों में दें जब तक विस्तार की जरूरत न हो।
- **आत्मविश्वास से जवाब दें**: यदि जानते हैं तो सीधे बताएं, अनुमान लगाने की जरूरत नहीं।

## लाइव मंडी डेटा (data.gov.in से):
${marketContext}

यह डेटा सरकारी स्रोत से है। मोडल प्राइस एक सांकेतिक मूल्य है, गारंटीड खरीद मूल्य नहीं।
`.trim();

// ─── Fallback responses (no API key) ──────────────────────────────────────────
const AGRI_KEYWORDS = [
  // Hindi
  'खेत', 'फसल', 'मंडी', 'बीज', 'खाद', 'किसान', 'कृषि', 'सिंचाई', 'MSP', 'भाव', 'दाम', 'पशु',
  'गेहूं', 'धान', 'चावल', 'दाल', 'सब्जी', 'फल', 'गन्ना', 'कपास', 'मक्का', 'बाजरा', 'ज्वार',
  'योजना', 'ऋण', 'बीमा', 'स्लॉट', 'बुकिंग', 'टोकन', 'सोयाबीन', 'मिर्च', 'प्याज', 'आलू',
  // English
  'farm', 'crop', 'mandi', 'seed', 'fertilizer', 'farmer', 'agriculture', 'irrigation', 'price',
  'wheat', 'rice', 'paddy', 'dal', 'pulse', 'vegetable', 'sugarcane', 'cotton', 'maize',
  'scheme', 'loan', 'insurance', 'slot', 'booking', 'token', 'soil', 'pest', 'disease',
  'harvest', 'sow', 'yield', 'kisan', 'apmc', 'enam', 'pmfby', 'pm-kisan', 'kcc',
];

const isAgricultureQuery = (text: string) => {
  const lower = text.toLowerCase();
  return AGRI_KEYWORDS.some((kw) => lower.includes(kw));
};

const smartFallback = (question: string): string => {
  const text = question.toLowerCase();
  if (!isAgricultureQuery(question)) {
    return 'माफ करें, मैं केवल कृषि और किसान-संबंधी सवालों का जवाब देता हूँ। कृपया खेती, मंडी, फसल, सरकारी योजनाओं या पशुपालन से जुड़ा सवाल पूछें।';
  }
  if (text.includes('pm-kisan') || text.includes('pm kisan') || text.includes('किसान सम्मान')) {
    return 'PM-KISAN योजना के तहत सभी किसानों को प्रति वर्ष ₹6,000 तीन किस्तों में सीधे बैंक खाते में मिलते हैं। pmkisan.gov.in पर आवेदन करें या अपने नजदीकी CSC सेंटर जाएं।';
  }
  if (text.includes('msp') || text.includes('न्यूनतम समर्थन')) {
    return 'MSP (न्यूनतम समर्थन मूल्य) सरकार द्वारा तय किया जाता है। 2024-25 में गेहूं का MSP ₹2,275/क्विंटल और धान का ₹2,300/क्विंटल है। सटीक दरों के लिए cacp.dacfw.nic.in देखें।';
  }
  if (text.includes('price') || text.includes('भाव') || text.includes('rate') || text.includes('mandi') || text.includes('मंडी')) {
    return 'लाइव मंडी भाव के लिए DATA_GOV_API_KEY और OPENAI_API_KEY सर्वर पर कॉन्फ़िगर करें। अभी enam.gov.in पर जाकर अपने राज्य का मंडी भाव देख सकते हैं।';
  }
  if (text.includes('slot') || text.includes('book') || text.includes('स्लॉट') || text.includes('बुकिंग')) {
    return 'स्लॉट बुकिंग के लिए पहले लॉगिन करें, फिर "Slot Booking" सेक्शन में जाएं। अपनी मंडी, तारीख और समय चुनकर टोकन बुक करें।';
  }
  if (text.includes('pmfby') || text.includes('फसल बीमा') || text.includes('insurance')) {
    return 'PM Fasal Bima Yojana (PMFBY) के तहत फसल नुकसान पर बीमा मिलता है। खरीफ फसलों पर 2% और रबी पर 1.5% प्रीमियम। pmfby.gov.in पर आवेदन करें।';
  }
  if (text.includes('kcc') || text.includes('kisan credit') || text.includes('किसान क्रेडिट')) {
    return 'Kisan Credit Card (KCC) से आप 4% ब्याज दर पर ₹3 लाख तक का ऋण ले सकते हैं। अपने नजदीकी बैंक (SBI, PNB, को-ऑपरेटिव) में आवेदन करें।';
  }
  return 'मैं खेती, मंडी भाव, सरकारी योजनाएं, फसल प्रबंधन और पशुपालन में मदद कर सकता हूँ। कृपया अपना सवाल स्पष्ट रूप से पूछें।';
};

// ─── Live market data ─────────────────────────────────────────────────────────
const getMarketSnapshot = async (): Promise<MarketRecord[]> => {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) return [];
  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    limit: '100',
    'filters[state]': process.env.MARKET_DATA_STATE || 'Maharashtra',
  });
  try {
    const response = await fetch(`${MARKET_API_URL}?${params.toString()}`, { next: { revalidate: 900 } });
    if (!response.ok) return [];
    const payload = await response.json() as { records?: Record<string, string | number | null | undefined>[] };
    return (payload.records || []).map((record) => ({
      commodity: String(record.commodity || record.Commodity || '').trim(),
      market: String(record.market || record.Market || '').trim(),
      modalPrice: Number(String(record.modal_price || record.Modal_Price || '').replace(/,/g, '')) || 0,
      arrivalQuantity: Number(String(record.arrivals_in_qtl || record.Arrivals_in_Qtl || '').replace(/,/g, '')) || 0,
      date: String(record.arrival_date || record.Arrival_Date || '').trim(),
    })).filter((record) => record.commodity && record.modalPrice > 0);
  } catch {
    return [];
  }
};

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json() as { messages?: ChatMessage[]; language?: string };
    const messages = (body.messages || [])
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content?.trim())
      .slice(-10);

    const latestMessage = messages.at(-1)?.content || '';
    if (!latestMessage) {
      return NextResponse.json({ success: false, message: 'एक सवाल जरूरी है।' }, { status: 400 });
    }

    // Non-agriculture guard (before calling AI to save cost)
    if (messages.length <= 2 && !isAgricultureQuery(latestMessage)) {
      return NextResponse.json({
        success: true,
        answer: 'माफ करें, मैं केवल कृषि और किसान-संबंधी सवालों का जवाब देता हूँ। खेती, मंडी, फसल, सरकारी योजनाओं या पशुपालन से जुड़ा सवाल पूछें।',
        grounded: false,
        source: 'Kisan Mitra scope filter',
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // No API key — use smart local fallback
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        answer: smartFallback(latestMessage),
        grounded: false,
        source: 'Kisan Mitra offline guidance',
      });
    }

    // Fetch live market data in parallel with AI call setup
    const records = await getMarketSnapshot();
    const marketContext = records.length
      ? `लाइव मंडी डेटा (data.gov.in, ${process.env.MARKET_DATA_STATE || 'Maharashtra'}):\n${JSON.stringify(records.slice(0, 80), null, 0)}`
      : 'लाइव मंडी डेटा अभी उपलब्ध नहीं है। कीमतें न बनाएं — MSP की सामान्य जानकारी दे सकते हैं।';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 600,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT(marketContext) },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'AI सेवा अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद पुनः प्रयास करें।' },
        { status: 502 }
      );
    }

    const payload = await response.json() as { choices?: { message?: { content?: string } }[] };
    const answer = payload.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        { success: false, message: 'AI सेवा ने खाली जवाब दिया। पुनः प्रयास करें।' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      answer,
      grounded: records.length > 0,
      source: records.length ? 'data.gov.in' : 'Kisan Mitra AI',
    });

  } catch {
    return NextResponse.json(
      { success: false, message: 'कनेक्शन में समस्या है। पुनः प्रयास करें।' },
      { status: 500 }
    );
  }
}
