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

    if (!process.env.APIFY_API_KEY) {
      return new Response(JSON.stringify({ error: "Apify API key not configured" }), {
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

    // STEP 2 — Scrape with Apify Instagram Scraper
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}&timeout=50&memory=256`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls: [url],
          resultsType: "posts",
          resultsLimit: 1,
        }),
      }
    );

    if (!runRes.ok) {
      const errText = await runRes.text();
      throw new Error(`Apify request failed (${runRes.status}): ${errText.slice(0, 200)}`);
    }

    const results = await runRes.json();
    console.log("Apify result:", JSON.stringify(results).slice(0, 500));

    const post = Array.isArray(results) ? results[0] : results;

    if (!post) {
      return new Response(JSON.stringify({
        error: "Could not fetch post data. Make sure the URL is a public Instagram post.",
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const caption = post.caption || post.text || post.description || "";
    const likes = post.likesCount || post.likes || 0;
    const comments = post.commentsCount || post.comments || 0;

    if (!caption) {
      return new Response(JSON.stringify({
        error: "Post found but caption is empty. The post may have no text caption.",
        debug: JSON.stringify(post).slice(0, 500),
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
