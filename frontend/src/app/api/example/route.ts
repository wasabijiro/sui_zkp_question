// app/api/route.ts

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const returnBody = `${body.name}`;

  return new Response(JSON.stringify({ body: returnBody }));
}
