import type { EtsyListingView } from "@/types";
import { env } from "@/lib/env";
import { readImportedEtsyShop, saveImportedEtsyShop } from "@/services/local-store";

const MAX_PUBLIC_LISTINGS = 120;
const MAX_SHOP_PAGES = 8;

export async function importEtsyShop(shopUrl: string) {
  const parsedShop = parseEtsyShopUrl(shopUrl);
  if (!parsedShop) {
    throw new Error("Please enter a valid Etsy shop URL, for example https://www.etsy.com/shop/ShopName.");
  }

  const importedShop = env.etsyApiKey ? await importOfficialEtsyShop(parsedShop, env.etsyApiKey) : await importPublicEtsyShop(parsedShop);
  saveImportedEtsyShop(importedShop);
  return { mode: env.etsyApiKey ? ("official-api" as const) : ("public-shop" as const), ...importedShop };
}

export async function getEtsyListings() {
  return readImportedEtsyShop()?.listings ?? [];
}

export async function getImportedEtsyShop() {
  return readImportedEtsyShop();
}

type ParsedShopUrl = {
  shopName: string;
  url: string;
};

function parseEtsyShopUrl(input: string): ParsedShopUrl | null {
  try {
    const url = new URL(input.trim());
    if (!url.hostname.toLowerCase().endsWith("etsy.com")) {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const shopIndex = parts.findIndex((part) => part.toLowerCase() === "shop");
    const shopName = shopIndex >= 0 ? parts[shopIndex + 1] : parts[0];

    if (!shopName) {
      return null;
    }

    return {
      shopName,
      url: `https://www.etsy.com/shop/${shopName}`
    };
  } catch {
    return null;
  }
}

async function importPublicEtsyShop(shop: ParsedShopUrl) {
  const [rssListings, pageListings] = await Promise.all([fetchShopRss(shop), fetchShopPageListings(shop)]);
  const listings = mergeListings([...rssListings, ...pageListings]).slice(0, MAX_PUBLIC_LISTINGS);

  if (!listings.length) {
    throw new Error(
      "No public Etsy listings could be imported from this shop link. The shop may be private, empty, region-blocked, or Etsy may have blocked public fetching. Add Etsy API credentials for the official import path."
    );
  }

  return {
    shop: {
      id: `shop-${slug(shop.shopName)}`,
      etsyShopId: shop.shopName,
      name: shop.shopName,
      url: shop.url
    },
    listings,
    importedAt: new Date().toISOString(),
    importWarning:
      listings.length <= 10
        ? "Public Etsy import returned only the listings Etsy exposes without API access. Add an Etsy API key on the server to import the full catalog."
        : undefined
  };
}

async function importOfficialEtsyShop(shop: ParsedShopUrl, apiKey: string) {
  const shopId = await fetchOfficialShopId(shop, apiKey);
  const listings = await fetchOfficialShopListings(shop, apiKey, shopId);

  if (!listings.length) {
    return importPublicEtsyShop(shop);
  }

  return {
    shop: {
      id: `shop-${slug(shop.shopName)}`,
      etsyShopId: String(shopId),
      name: shop.shopName,
      url: shop.url
    },
    listings,
    importedAt: new Date().toISOString()
  };
}

async function fetchOfficialShopId(shop: ParsedShopUrl, apiKey: string) {
  const data = await fetchEtsyApi<{ results?: Array<{ shop_id?: number; shop_name?: string }> }>(
    `/shops?shop_name=${encodeURIComponent(shop.shopName)}`,
    apiKey
  );
  const exactShop = data.results?.find((result) => result.shop_name?.toLowerCase() === shop.shopName.toLowerCase());
  const shopId = exactShop?.shop_id ?? data.results?.[0]?.shop_id;

  if (!shopId) {
    throw new Error("Etsy API could not find this shop. Check the shop link or API key.");
  }

  return shopId;
}

async function fetchOfficialShopListings(shop: ParsedShopUrl, apiKey: string, shopId: number) {
  const listings: EtsyListingView[] = [];
  const limit = 100;

  for (let offset = 0; offset < MAX_PUBLIC_LISTINGS; offset += limit) {
    const data = await fetchEtsyApi<{ count?: number; results?: EtsyApiListing[] }>(
      `/shops/${shopId}/listings/active?limit=${limit}&offset=${offset}&includes=Images`,
      apiKey
    );

    const pageListings = data.results ?? [];
    listings.push(...pageListings.map((listing, index) => officialListingToView(shop, listing, offset + index)));

    if (pageListings.length < limit || listings.length >= (data.count ?? MAX_PUBLIC_LISTINGS)) {
      break;
    }
  }

  return mergeListings(listings).slice(0, MAX_PUBLIC_LISTINGS);
}

async function fetchEtsyApi<T>(path: string, apiKey: string): Promise<T> {
  const response = await fetch(`https://api.etsy.com/v3/application${path}`, {
    headers: {
      "x-api-key": apiKey,
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Etsy API request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

type EtsyApiListing = {
  listing_id?: number;
  title?: string;
  description?: string;
  price?: string | { amount?: number; divisor?: number; currency_code?: string };
  currency_code?: string;
  tags?: string[];
  taxonomy_path?: string[];
  category_path?: string[];
  url?: string;
  state?: string;
  created_timestamp?: number;
  updated_timestamp?: number;
  images?: Array<{
    url_570xN?: string;
    url_fullxfull?: string;
    url_170x135?: string;
  }>;
};

function officialListingToView(shop: ParsedShopUrl, listing: EtsyApiListing, index: number): EtsyListingView {
  const listingId = String(listing.listing_id ?? `${shop.shopName}-${index + 1}`);
  const price = normalizeApiPrice(listing.price);
  const category = listing.taxonomy_path?.join(" / ") ?? listing.category_path?.join(" / ") ?? "Etsy Shop Listing";
  const createdAt = listing.created_timestamp ? new Date(listing.created_timestamp * 1000).toISOString() : new Date().toISOString();
  const updatedAt = listing.updated_timestamp ? new Date(listing.updated_timestamp * 1000).toISOString() : createdAt;

  return {
    id: `listing-${listingId}`,
    shopId: `shop-${slug(shop.shopName)}`,
    etsyListingId: listingId,
    title: listing.title ?? "Untitled Etsy listing",
    description: listing.description ?? listing.title ?? "",
    price: price.amount,
    currency: price.currency ?? listing.currency_code ?? "USD",
    images: (listing.images ?? [])
      .map((image) => image.url_570xN ?? image.url_fullxfull ?? image.url_170x135)
      .filter((image): image is string => Boolean(image)),
    tags: listing.tags?.length ? listing.tags : inferTags(listing.title ?? ""),
    category,
    listingUrl: listing.url ?? `https://www.etsy.com/listing/${listingId}`,
    status: listing.state === "active" ? "active" : "inactive",
    createdAt,
    updatedAt
  };
}

function normalizeApiPrice(price: EtsyApiListing["price"]) {
  if (typeof price === "string") {
    return { amount: Number(price) || 0, currency: undefined };
  }

  if (price && typeof price.amount === "number") {
    return {
      amount: price.amount / (price.divisor || 100),
      currency: price.currency_code
    };
  }

  return { amount: 0, currency: undefined };
}

async function fetchShopRss(shop: ParsedShopUrl): Promise<EtsyListingView[]> {
  const rssUrl = `${shop.url}/rss`;
  const response = await fetch(rssUrl, {
    headers: {
      "User-Agent": "PinPilot/0.1 local desktop app"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, MAX_PUBLIC_LISTINGS);

  return items
    .map((match, index) => {
      const item = match[1];
      const title = decodeXml(readTag(item, "title"));
      const link = decodeXml(readTag(item, "link"));
      const descriptionHtml = decodeXml(readTag(item, "description"));
      const image = extractImage(descriptionHtml);
      const listingId = extractListingId(link) ?? `${shop.shopName}-${index + 1}`;

      if (!title || !link) {
        return null;
      }

      return toListing({
        shop,
        listingId,
        title,
        description: stripHtml(descriptionHtml) || title,
        image,
        listingUrl: link,
        index
      });
    })
    .filter((listing): listing is EtsyListingView => Boolean(listing));
}

async function fetchShopPageListings(shop: ParsedShopUrl): Promise<EtsyListingView[]> {
  const listings: EtsyListingView[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= MAX_SHOP_PAGES && listings.length < MAX_PUBLIC_LISTINGS; page += 1) {
    const pageListings = await fetchShopPageListingBatch(shop, page);
    let newItems = 0;

    for (const listing of pageListings) {
      if (seen.has(listing.etsyListingId)) {
        continue;
      }

      seen.add(listing.etsyListingId);
      listings.push(listing);
      newItems += 1;
    }

    if (page > 1 && newItems === 0) {
      break;
    }
  }

  return listings;
}

async function fetchShopPageListingBatch(shop: ParsedShopUrl, page: number): Promise<EtsyListingView[]> {
  const url = new URL(shop.url);
  if (page > 1) {
    url.searchParams.set("page", String(page));
  }

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Mozilla/5.0 PinPilot local desktop app",
      Accept: "text/html"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return [];
  }

  const html = normalizeHtml(await response.text());
  const listingUrls = extractListingUrls(html).slice(0, MAX_PUBLIC_LISTINGS);

  return listingUrls.map((listingUrl, index) => {
    const listingId = extractListingId(listingUrl) ?? `${shop.shopName}-${index + 1}`;
    const title = titleFromUrl(listingUrl);

    return toListing({
      shop,
      listingId,
      title,
      description: title,
      image: extractNearbyImage(html, listingId),
      listingUrl,
      index
    });
  });
}

function mergeListings(listings: EtsyListingView[]) {
  const seen = new Set<string>();
  const merged: EtsyListingView[] = [];

  for (const listing of listings) {
    if (seen.has(listing.etsyListingId)) {
      continue;
    }

    seen.add(listing.etsyListingId);
    merged.push(listing);
  }

  return merged;
}

function toListing({
  shop,
  listingId,
  title,
  description,
  image,
  listingUrl,
  index
}: {
  shop: ParsedShopUrl;
  listingId: string;
  title: string;
  description: string;
  image?: string;
  listingUrl: string;
  index: number;
}): EtsyListingView {
  const now = new Date().toISOString();

  return {
    id: `listing-${listingId}`,
    shopId: `shop-${slug(shop.shopName)}`,
    etsyListingId: listingId,
    title,
    description,
    price: 0,
    currency: "USD",
    images: image ? [image] : [],
    tags: inferTags(title),
    category: "Etsy Shop Listing",
    listingUrl,
    status: "active",
    createdAt: now,
    updatedAt: now
  };
}

function readTag(xml: string, tag: string) {
  return xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? "";
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractImage(value: string) {
  return value.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
}

function extractNearbyImage(html: string, listingId: string) {
  const index = html.indexOf(listingId);
  if (index < 0) {
    return undefined;
  }

  const nearby = html.slice(Math.max(0, index - 2000), index + 2000);
  return nearby.match(/https:\/\/i\.etsystatic\.com\/[^"'\s]+/i)?.[0]?.replace(/\\u002F/g, "/");
}

function extractListingId(url: string) {
  return url.match(/\/listing\/(\d+)\//)?.[1];
}

function extractListingUrls(html: string) {
  const urls = new Set<string>();
  const matches = html.matchAll(/(?:https?:\/\/www\.etsy\.com)?\/listing\/(\d+)\/([^"'<>\s?]+)/g);

  for (const match of matches) {
    const listingId = match[1];
    const slugPart = match[2].replace(/[#&].*$/, "");

    if (!listingId || !slugPart || slugPart.includes("{")) {
      continue;
    }

    urls.add(`https://www.etsy.com/listing/${listingId}/${slugPart}`);
  }

  return Array.from(urls);
}

function normalizeHtml(html: string) {
  return html.replace(/\\u002F/g, "/").replace(/\\\//g, "/").replace(/&amp;/g, "&");
}

function titleFromUrl(url: string) {
  const slugPart = url.split("/listing/")[1]?.split("/")[1] ?? "etsy-listing";
  return slugPart
    .split("?")[0]
    .split("-")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function inferTags(title: string) {
  return Array.from(
    new Set(
      title
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 3)
        .slice(0, 8)
    )
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
