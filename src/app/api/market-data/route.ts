import { NextResponse } from 'next/server';

type GovernmentRecord = Record<string, string | number | null | undefined>;

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const API_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

const asText = (value: GovernmentRecord[string]) => String(value ?? '').trim();
const asNumber = (value: GovernmentRecord[string]) => {
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

export async function GET() {
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      message: 'Add DATA_GOV_API_KEY to load live mandi prices from data.gov.in.',
      source: 'data.gov.in',
    }, { status: 503 });
  }

  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    limit: '100',
    'filters[state]': process.env.MARKET_DATA_STATE || 'Maharashtra',
  });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: 'The government market feed is temporarily unavailable.', source: 'data.gov.in' }, { status: 502 });
    }

    const payload = await response.json() as { records?: GovernmentRecord[] };
    const records = (payload.records || [])
      .map((record) => ({
        commodity: asText(record.commodity || record.Commodity),
        market: asText(record.market || record.Market),
        state: asText(record.state || record.State),
        district: asText(record.district || record.District),
        modalPrice: asNumber(record.modal_price || record.Modal_Price),
        arrivalQuantity: asNumber(record.arrivals_in_qtl || record.Arrivals_in_Qtl),
        date: asText(record.arrival_date || record.Arrival_Date || record.timestamp),
      }))
      .filter((record) => record.commodity && record.modalPrice > 0);

    return NextResponse.json({
      success: true,
      source: 'data.gov.in',
      resource: RESOURCE_ID,
      sourceUrl: `https://data.gov.in/resource/${RESOURCE_ID}`,
      state: process.env.MARKET_DATA_STATE || 'Maharashtra',
      records,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Unable to reach the government market feed.', source: 'data.gov.in' }, { status: 502 });
  }
}
