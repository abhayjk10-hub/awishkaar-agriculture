# Kisan Mitra — SIH26032

Farmer Procurement Queue & Status System — A Government of India Initiative.

## Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   - Rename `.env.local` and fill in your credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
     ```
   - Enable **Phone Auth** in Supabase Dashboard → Authentication → Providers → Phone
  - Configure an SMS provider in Supabase Phone Auth (Twilio, MessageBird, or Vonage) so OTPs are delivered to the farmer&apos;s registered mobile number
   - Create the `farmers` table (see schema below)
   - Create the `contact_submissions` table (see schema below)

3. **Configure live government market data (optional but recommended)**
  - Create an API key at [data.gov.in](https://data.gov.in/).
  - Add it to `.env.local`:
    ```
    DATA_GOV_API_KEY=your_data_gov_api_key
    MARKET_DATA_STATE=Maharashtra
    OPENAI_API_KEY=your_openai_api_key
    OPENAI_MODEL=gpt-4o-mini
    ```
    - The home page reads the Government of India mandi-price resource and shows modal-price and arrival-share charts with a source link and calculation method. Without the data key, it shows a clear connection state instead of sample data.
    - The farmer chatbot uses the AI key only on the server and grounds market answers in the same data.gov.in feed. Without it, the assistant provides limited navigation guidance and does not invent prices.

4. **Run locally**
   ```bash
   npm run dev
   ```

## Supabase Schema

### farmers
```sql
create table farmers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) unique,
  full_name text not null,
  mobile_number text not null,
  village text not null,
  district text not null,
  state text not null,
  land_plot_id text not null,
  preferred_language text not null default 'en',
  created_at timestamptz default now()
);

-- RLS
alter table farmers enable row level security;
create policy "Farmers can read own record" on farmers for select using (auth.uid() = user_id);
create policy "Farmers can insert own record" on farmers for insert with check (auth.uid() = user_id);
create policy "Farmers can update own record" on farmers for update using (auth.uid() = user_id);
```

### contact_submissions
```sql
create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  farmer_name text not null,
  mobile_number text not null,
  message_type text not null check (message_type in ('Query', 'Suggestion', 'Grievance')),
  message text not null,
  synced_to_sheet boolean default false,
  created_at timestamptz default now()
);

-- RLS: allow inserts from anyone (public contact form), admins read via service role
alter table contact_submissions enable row level security;
create policy "Anyone can submit contact" on contact_submissions for insert with check (true);
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (Header + Footer)
│   ├── page.tsx            # Home page
│   ├── login/page.tsx      # Login / Register page
│   ├── contact/page.tsx    # Contact page
│   └── slot-booking/       # Slot booking (placeholder)
├── components/
│   ├── shared/             # Reusable design system components
│   ├── auth/               # LoginForm, RegisterForm
│   └── contact/            # ContactForm
├── contexts/               # AuthContext, LanguageContext
├── lib/
│   ├── supabase/           # Supabase client (browser + server)
│   └── translations/       # i18n strings (EN, HI, MR, PA, GU)
└── types/                  # Shared TypeScript types
```

## Supported Languages
- English (en)
- हिंदी (hi)
- मराठी (mr)
- ਪੰਜਾਬੀ (pa)
- ગુજરાતી (gu)
