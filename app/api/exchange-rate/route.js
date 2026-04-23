import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "exchange-cache.json");

function readCache() {
    try {
        if(fs.existsSync(CACHE_PATH)) {
            const raw = fs.readFileSync(CACHE_PATH, "utf-8");
            return JSON.parse(raw);
        }
    } catch (error) {
        console.log("Reading cache error:", error);
    }
    return null;
}

function writeCache(data) {
    try {
        fs.writeFileSync(CACHE_PATH, JSON.stringify(data), "utf-8");
    } catch (error) {
        console.error("Writing cache error:", error);
    }
}

function isCacheValid(cache) {
    if(!cache || !cache.time_next_update_utc) return false;
    const nextUpdate = new Date(cache.time_next_update_utc);
    return new Date() < nextUpdate;
}

export async function GET(request) {
    const cache = readCache();

    if(isCacheValid(cache)) {
        console.log("Cache is valid");
        return NextResponse.json({
            rates: cache.conversion_rates,
            base: cache.base_code,
            nextUpdate: cache.time_next_update_utc,
            lastUpdated: cache.time_last_update_utc,
            source: "cache",
    });
    }

    const apiKey = process.env.EXCHANGE_API_KEY;

    try {
        console.log("API will be called...")
        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
        );

        const data = await response.json();

        writeCache(data);

        return NextResponse.json({
            rates: data.conversion_rates,
            base: data.base_code,
            nextUpdate: data.time_next_update_utc,
            lastUpdated: data.time_last_update_utc,
            source: "api",
        });
    } catch (error) {
        if (cache) {
            console.log("No internet. Cache used instead.");
            return NextResponse.json({
                rates: cache.conversion_rates,
                base: cache.base_code,
                nextUpdate: cache.time_next_update_utc,
                lastUpdated: cache.time_last_update_utc,
                source: "offline-cache",
            });
            }

        return NextResponse.json(
            { error: "No internet and no cache available." },
            { status: 500 }
        );
    }
}