console.log("MAPTILER_KEY:", process.env.MAPTILER_KEY);


import 'dotenv/config';
import fetch from 'node-fetch';

console.log("MAPTILER_KEY:", process.env.MAPTILER_KEY);
const MAPTILER_KEY = process.env.MAPTILER_KEY;

async function geocode(address) {
    const clean = address.replace(/\r/g, "").trim();
    const fullAddress = `${clean}, Forsyth County, Georgia, USA`;
    const bbox = "-84.35,34.00,-84.05,34.25";

    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(fullAddress)}.json?key=${encodeURIComponent(MAPTILER_KEY || '')}&bbox=${bbox}`;

    try {
        const res = await fetch(url);
        const text = await res.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("Non‑JSON response for:", fullAddress);
            return { lat: null, lng: null };
        }

        if (!data.features || data.features.length === 0) {
            console.error("No geocode result for:", fullAddress);
            return { lat: null, lng: null };
        }

        const [lng, lat] = data.features[0].center;

        if (lat < 33.5 || lat > 34.5 || lng < -85 || lng > -83) {
            console.error("Rejected out‑of‑region result:", fullAddress, lat, lng);
            return { lat: null, lng: null };
        }

        return { lat, lng };
    } catch (err) {
        console.error("Fetch error for:", fullAddress, err);
        return { lat: null, lng: null };
    }
}
