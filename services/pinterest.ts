import { demoPinDrafts } from "@/lib/demo-data";
import {
  readPinterestAppCredentials,
  readPinterestAuth,
  savePinterestAuth
} from "@/services/local-store";
import type { PinDraftView, PinterestBoardView, PinterestPublishResult } from "@/types";

const PINTEREST_API_BASE = "https://api.pinterest.com/v5";
const PINTEREST_OAUTH_BASE = "https://www.pinterest.com/oauth/";
const PINTEREST_SCOPES = ["boards:read", "pins:read", "pins:write", "user_accounts:read"];

export function isPinterestConnected() {
  return Boolean(readPinterestAuth()?.accessToken);
}

export function getPinterestCredentials() {
  const storedCredentials = readPinterestAppCredentials();

  return {
    clientId: storedCredentials?.clientId,
    clientSecret: storedCredentials?.clientSecret
  };
}

export function hasPinterestCredentials() {
  const credentials = getPinterestCredentials();
  return Boolean(credentials.clientId && credentials.clientSecret);
}

export function getPinterestAuthorizeUrl({ redirectUri, state }: { redirectUri: string; state: string }) {
  const credentials = getPinterestCredentials();

  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error("Pinterest app bilgileri eksik. Ayarlar ekranindan Client ID ve Client Secret ekle.");
  }

  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: PINTEREST_SCOPES.join(","),
    state
  });

  return `${PINTEREST_OAUTH_BASE}?${params.toString()}`;
}

export async function exchangePinterestCode({ code, redirectUri }: { code: string; redirectUri: string }) {
  const credentials = getPinterestCredentials();

  if (!credentials.clientId || !credentials.clientSecret) {
    throw new Error("Pinterest app bilgileri eksik.");
  }

  const basicAuth = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64");
  const response = await fetch(`${PINTEREST_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    })
  });

  if (!response.ok) {
    throw new Error(`Pinterest token exchange failed: ${await response.text()}`);
  }

  const payload = await response.json();
  savePinterestAuth({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: payload.expires_in ? new Date(Date.now() + payload.expires_in * 1000).toISOString() : undefined,
    scope: payload.scope,
    connectedAt: new Date().toISOString()
  });
}

export async function getPinterestBoards() {
  const auth = readPinterestAuth();
  if (!auth?.accessToken) {
    return [];
  }

  const response = await fetch(`${PINTEREST_API_BASE}/boards?page_size=100`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Pinterest boards could not be loaded: ${await response.text()}`);
  }

  const payload = await response.json();
  return (payload.items ?? []).map((board: { id: string; name: string; description?: string; url?: string }) => ({
    id: board.id,
    pinterestBoardId: board.id,
    name: board.name,
    description: board.description ?? "",
    url: board.url
  })) as PinterestBoardView[];
}

export async function createPinterestPinDraft(input: Omit<PinDraftView, "id" | "createdAt">) {
  return {
    ...input,
    id: `pin-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: input.status ?? "draft",
    mode: hasPinterestCredentials() ? "api-ready" : "local"
  };
}

export async function getPinterestPinDrafts() {
  return demoPinDrafts;
}

export async function publishPinterestPin(draft: PinDraftView): Promise<PinterestPublishResult> {
  const auth = readPinterestAuth();
  if (!auth?.accessToken) {
    throw new Error("Pinterest is not connected. Connect Pinterest before publishing.");
  }

  if (!draft.boardId) {
    throw new Error("Choose a Pinterest board before publishing.");
  }

  const response = await fetch(`${PINTEREST_API_BASE}/pins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      board_id: draft.boardId,
      title: draft.title,
      description: draft.description,
      link: draft.destinationUrl,
      media_source: {
        source_type: "image_url",
        url: draft.imageUrl
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Pinterest publish failed: ${await response.text()}`);
  }

  const payload = await response.json();
  return {
    id: payload.id,
    url: payload.url
  };
}
