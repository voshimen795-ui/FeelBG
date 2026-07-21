"use strict";

const Anthropic = require("@anthropic-ai/sdk");
const FEELBG_VENUES = require("../js/venues.js");

const LANGUAGE_NAMES = {
    en: "English",
    sr: "Serbian",
    tr: "Turkish",
    de: "German",
    fr: "French",
    it: "Italian",
    ru: "Russian",
    el: "Greek",
    he: "Hebrew",
};

const MOOD_LABELS = {
    romantic: "romantic date night",
    friends: "fun night out with friends",
    family: "relaxed family outing",
    business: "polished business dinner",
};

const INTEREST_LABELS = {
    food: "great food and local cuisine",
    nightlife: "partying and nightlife",
    culture: "culture, history and sights",
    chill: "relaxed cafes and easy vibes",
};

const TIME_LABELS = {
    short: "about 2 hours",
    evening: "a full evening",
    all_night: "the whole night, into the early hours",
};

const BUDGET_LABELS = {
    budget: "budget-friendly",
    moderate: "moderate",
    upscale: "upscale, no expense spared",
};

const ADVENTURE_SCHEMA = {
    type: "object",
    properties: {
        title: { type: "string", description: "A short, evocative title for this evening, 3-7 words" },
        intro: { type: "string", description: "1-2 sentence cinematic opening that sets the scene" },
        stops: {
            type: "array",
            minItems: 2,
            maxItems: 4,
            items: {
                type: "object",
                properties: {
                    venueName: {
                        type: "string",
                        description: "Must exactly match one 'name' field from the supplied venue list",
                    },
                    timeOfDay: { type: "string", description: "e.g. 'Golden hour', 'After dinner', 'Late night'" },
                    narrative: {
                        type: "string",
                        description: "2-3 warm, sensory sentences weaving this stop into the story",
                    },
                },
                required: ["venueName", "timeOfDay", "narrative"],
                additionalProperties: false,
            },
        },
        outro: { type: "string", description: "1-2 sentence closing line for the evening" },
    },
    required: ["title", "intro", "stops", "outro"],
    additionalProperties: false,
};

function buildVenuePool() {
    const pool = [];
    ["restaurants", "cafes", "nightlife"].forEach((cat) => {
        (FEELBG_VENUES[cat] || []).forEach((v) => {
            pool.push({
                name: v.name,
                category: cat,
                area: v.area || "",
                cuisine: v.cuisineLabel || "",
                price: v.priceLabel || "",
                rating: v.rating || null,
                description: v.description || "",
                image: v.image || "",
            });
        });
    });
    return pool;
}

function buildAttractionPool() {
    return (FEELBG_VENUES.attractions || []).map((a) => ({
        name: a.name,
        area: a.area || "",
        description: a.description || "",
    }));
}

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.status(405).json({ error: "method_not_allowed" });
        return;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
        res.status(503).json({ error: "not_configured" });
        return;
    }

    const body = req.body || {};
    const mood = MOOD_LABELS[body.mood] || "a memorable evening out";
    const time = TIME_LABELS[body.time] || "a few hours";
    const budget = BUDGET_LABELS[body.budget] || "moderate";
    const targetLanguage = LANGUAGE_NAMES[body.language] || "English";
    const interests = (Array.isArray(body.interests) ? body.interests : [])
        .map((i) => INTEREST_LABELS[i])
        .filter(Boolean);
    const interestText = interests.length ? interests.join(", ") : "an authentic mix of Belgrade experiences";

    const venuePool = buildVenuePool();
    if (!venuePool.length) {
        res.status(500).json({ error: "no_venues" });
        return;
    }
    const attractionPool = buildAttractionPool();

    const client = new Anthropic();

    try {
        const response = await client.beta.messages.create({
            model: "claude-fable-5",
            max_tokens: 2048,
            betas: ["server-side-fallback-2026-06-01"],
            fallbacks: [{ model: "claude-opus-4-8" }],
            system:
                "You are FeelBG's storytelling concierge for Belgrade, Serbia. Write a short, cinematic, sensory 'evening adventure' for a visitor, built from 2-4 real stops chosen ONLY from the venue list provided in the user message — never invent a venue or use one not in the list. Each stop's venueName must match a provided venue's name exactly, character for character. Order stops in a sensible sequence for the requested time of day. Attractions are supplied only for scene-setting color between or before venue stops — never make them a 'stop' with a venueName, since they can't be reserved. Respond entirely in " +
                targetLanguage +
                ". Keep the prose warm and vivid but concise.",
            messages: [
                {
                    role: "user",
                    content:
                        "Plan an evening for: " +
                        mood +
                        ". They are most interested in: " +
                        interestText +
                        ". Time available: " +
                        time +
                        ". Budget: " +
                        budget +
                        ".\n\nReservable venues (choose stops only from here):\n" +
                        JSON.stringify(venuePool) +
                        "\n\nNearby attractions (color/context only, not reservable):\n" +
                        JSON.stringify(attractionPool),
                },
            ],
            output_config: { format: { type: "json_schema", schema: ADVENTURE_SCHEMA } },
        });

        if (response.stop_reason === "refusal") {
            res.status(502).json({ error: "refused" });
            return;
        }

        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock) {
            res.status(502).json({ error: "empty_response" });
            return;
        }

        let adventure;
        try {
            adventure = JSON.parse(textBlock.text);
        } catch (parseErr) {
            res.status(502).json({ error: "bad_json" });
            return;
        }

        // Hydrate each stop with the real venue record (image, area, rating) and
        // silently drop any hallucinated name that isn't in the actual pool.
        const byName = {};
        venuePool.forEach((v) => {
            byName[v.name] = v;
        });
        adventure.stops = (adventure.stops || [])
            .filter((s) => byName[s.venueName])
            .map((s) => Object.assign({}, s, { venue: byName[s.venueName] }));

        if (!adventure.stops.length) {
            res.status(502).json({ error: "no_valid_stops" });
            return;
        }

        res.status(200).json(adventure);
    } catch (err) {
        res.status(502).json({ error: "upstream_error" });
    }
};
