# Etsy Easy Post Tool

Local-first MVP for online sellers. The app imports shop listings from an Etsy shop link, generates AI-assisted marketing content, prepares post drafts, and includes an optional connected social account flow.

## AI API Keys

You can add AI keys inside the app from `Settings`.

Optional Vercel environment variables:

```bash
GEMINI_API_KEY=
```

or:

```bash
OPENAI_API_KEY=
```

Etsy works from a shop link entered inside the app. No Etsy API key is required for the current MVP.

Connected social account credentials are entered in the app from `Settings`, not through Vercel environment variables.

## Local Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Desktop App

```bash
npm run desktop:build
```

## Vercel Setup

In Vercel, you can either add an env variable:

```bash
GEMINI_API_KEY=
```

or open the deployed app and add the AI key from `Settings`.

Public privacy policy route:

```text
/privacy
```

## Main Flow

1. Enter an Etsy shop link.
2. Import product listings.
3. Choose a product.
4. Generate AI marketing content.
5. Create a post draft.
6. Optionally connect a social account from Settings.

## Notes

The app intentionally avoids requiring database, Supabase, or Etsy API environment variables for this MVP.
