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

    // STEP 2 — Scrape with ScrapingDog
    // Extract ID from Instagram URL (shortcode)
    // Works for /p/, /reels/, /tv/
    const idMatch = url.match(/(?:\/p\/|\/reels\/|\/tv\/)([^\/?#&]+)/);
    const postId = idMatch ? idMatch[1] : url;

    const scrapeRes = await fetch(
      `https://api.scrapingdog.com/profile/post?api_key=${process.env.SCRAPINGDOG_API_KEY}&id=${postId}`
    );
    const scrapeData = await scrapeRes.json();

    // Log for debugging
    console.log("Scrape Data:", JSON.stringify(scrapeData).slice(0, 500));

    // Handle the new response structure
    const postData = Array.isArray(scrapeData) ? scrapeData[0] : scrapeData;
    
    // Attempt multiple paths for the caption
    const caption = postData?.edge_media_to_caption?.edges[0]?.node?.text || 
                    postData?.caption?.text || 
                    postData?.caption || 
                    postData?.text ||
                    postData?.accessibility_caption || 
                    "";
    
    const likes = postData?.edge_media_preview_like?.count || postData?.like_count || postData?.likes || 0;
    const comments = postData?.edge_media_to_parent_comment?.count || postData?.comment_count || postData?.comments || 0;

    if (!caption) {
      const apiError = scrapeData?.error || scrapeData?.message || "";
      const errorMsg = apiError ? `API Error: ${apiError}` : "Could not extract caption. Make sure the post is public and the ID is correct.";
      
      return new Response(JSON.stringify({ error: errorMsg }), {
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
