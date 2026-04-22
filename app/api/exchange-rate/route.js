import { NextResponse } from "next/server";

export async function GET(request) {
    // Parameters (Example: ?from=CAD&to=MXN)
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || "CAD";
    const to = searchParams.get("to") || "MXN";

    const apiKey = process.env.EXCHANGE_API_KEY;

    try {
        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`
        );

        const data = await response.json();

        return NextResponse.json({
            from,
            to,
            rate: data.conversion_rate,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "API call error"},
            { status: 500 }
        );
    }
}