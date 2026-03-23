export const maxDuration = 60;

export async function POST(req) {
  try {
    const { url } = await req.json();

    // STEP 1 — Validate input
    if (!url) {
      return new Response(JSON.stringify({ error: "Please provide an Instagram URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!process.env.SCRAPINGDOG_API_KEY) {
      return new Response(JSON.stringify({ error: "ScrapingDog API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenRouter API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // STEP 2 — Scrape with ScrapingDog (general scraper → extract og:description)
    const scrapeRes = await fetch(
      `https://api.scrapingdog.com/scrape?api_key=${process.env.SCRAPINGDOG_API_KEY}&url=${encodeURIComponent(url)}&dynamic=false`
    );

    if (!scrapeRes.ok) {
      throw new Error(`ScrapingDog request failed with status: ${scrapeRes.status}`);
    }

    const html = await scrapeRes.text();
    console.log("HTML length:", html.length, "| Preview:", html.slice(0, 300));

    // Instagram embeds the caption in og:description
    const ogDescMatch =
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);

    let caption = "";
    if (ogDescMatch && ogDescMatch[1]) {
      const raw = ogDescMatch[1]
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

      // og:description format: "N likes, N comments - Username: Caption here"
      const colonMatch = raw.match(/:\s*[""]?(.+)/s);
      caption = colonMatch ? colonMatch[1].replace(/[""]$/, "").trim() : raw.trim();
    }

    // Fallback: try JSON-LD
    if (!caption) {
      const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
      if (jsonLdMatch) {
        try {
          const jsonLd = JSON.parse(jsonLdMatch[1]);
          caption = jsonLd?.description || jsonLd?.caption || "";
        } catch {}
      }
    }

    // Extract likes/comments counts from the og:description text
    const rawDesc = ogDescMatch?.[1] || "";
    const likesMatch = rawDesc.match(/(\d[\d,]*)\s*likes?/i);
    const commentsMatch = rawDesc.match(/(\d[\d,]*)\s*comments?/i);
    const likes = likesMatch ? parseInt(likesMatch[1].replace(/,/g, "")) : 0;
    const comments = commentsMatch ? parseInt(commentsMatch[1].replace(/,/g, "")) : 0;

    if (!caption) {
      return new Response(JSON.stringify({
        error: "Could not extract caption. Make sure the post is public and the URL is a direct Instagram post link (/p/, /reel/).",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // STEP 3 — Analyse with OpenRouter
    const analysisRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a social media content strategist. Return only valid JSON." },
          {
            role: "user",
            content: `Analyse this Instagram caption and return JSON with exactly these keys: { hook, hookType, contentType, structure, mainIdea, tone, whatWorksWell }. Caption: ${caption}`,
          },
        ],
      }),
    });

    const analysisData = await analysisRes.json();
    if (!analysisData.choices || !analysisData.choices[0]) {
      throw new Error(analysisData.error?.message || "Failed to analyze caption");
    }
    const analysis = JSON.parse(analysisData.choices[0].message.content);

    // STEP 4 — Rewrite with OpenRouter
    const rewriteRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a social media content strategist. Return only valid JSON." },
          {
            role: "user",
            content: `Rewrite this Instagram caption for a social media marketing agency. Brand voice: educational, engaging, slightly provocative. Keep same structure but 100% original. Return JSON with exactly these keys: { hook, caption, hashtags: [array of exactly 20 hashtags without the hash symbol], cta }. Original caption: ${caption}`,
          },
        ],
      }),
    });

    const rewriteData = await rewriteRes.json();
    if (!rewriteData.choices || !rewriteData.choices[0]) {
      throw new Error(rewriteData.error?.message || "Failed to rewrite caption");
    }
    const rewrite = JSON.parse(rewriteData.choices[0].message.content);

    return new Response(
      JSON.stringify({
        original: { caption, likes, comments },
        analysis,
        rewrite,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
