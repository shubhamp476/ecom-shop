import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/products" && ["GET", "HEAD"].includes(request.method)) return NextResponse.next();
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return NextResponse.json({ success: false, error: "Configure ADMIN_USERNAME and ADMIN_PASSWORD to enable administration." }, { status: 503 });
  }
  const expected = Buffer.from(`Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`);
  const supplied = Buffer.from(request.headers.get("authorization") || "");
  if (expected.length === supplied.length && timingSafeEqual(expected, supplied)) return NextResponse.next();
  return new NextResponse("Administrator sign-in required", {
    status: 401, headers: { "WWW-Authenticate": 'Basic realm="ECOM-SHOP Admin", charset="UTF-8"', "Cache-Control": "no-store" },
  });
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*", "/api/products", "/api/seed"] };
