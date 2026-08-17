import { NextResponse } from "next/server";
import { getBrandById } from "@/config/brands";
import { generateBrandDescription, generateBrandSecondaryDescription } from "@/services/nvidiaService";
import { brandDescriptionCache, brandSecondaryDescriptionCache } from "@/server/brandDescriptionCache";

// Resolves one of the two description lines for `brand`: a cache hit
// returns immediately, otherwise it generates via NVIDIA. Any failure
// (bad key, rate limit, network error, timeout, malformed response) never
// surfaces as a raw error — it falls back to a stale cached value if one
// exists, otherwise brand[fallbackField].
async function resolveLine(cache, generator, brand, fallbackField) {
  if (cache.has(brand.id)) {
    return { text: cache.get(brand.id), cached: true };
  }

  try {
    const text = await generator(brand);
    return { text, cached: false };
  } catch {
    const staleCached = cache.get(brand.id);
    return { text: staleCached ?? brand[fallbackField], cached: cache.has(brand.id) };
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const brandId = body?.brandId;
  const brand = typeof brandId === "string" ? getBrandById(brandId) : undefined;

  if (!brand) {
    return NextResponse.json({ error: "Unknown brandId" }, { status: 400 });
  }

  const [primary, secondary] = await Promise.all([
    resolveLine(brandDescriptionCache, generateBrandDescription, brand, "fallback"),
    resolveLine(brandSecondaryDescriptionCache, generateBrandSecondaryDescription, brand, "secondaryFallback"),
  ]);

  return NextResponse.json({
    brandId: brand.id,
    description: primary.text,
    secondaryDescription: secondary.text,
    cached: primary.cached,
    secondaryCached: secondary.cached,
  });
}
