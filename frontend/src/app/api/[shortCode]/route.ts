import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface Params {
  shortCode: string;
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { shortCode } = await context.params;

    const response = await fetch(
      `${API_BASE_URL}/api/${shortCode}`,
      {
        method: "DELETE",
      }
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Proxy request failed" },
      { status: 500 }
    );
  }
}
