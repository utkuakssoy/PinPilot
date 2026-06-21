import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectTo = requestUrl.origin + "/dashboard";

  return NextResponse.redirect(redirectTo);
}
