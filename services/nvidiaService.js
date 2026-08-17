import { brandDescriptionCache, brandSecondaryDescriptionCache } from "@/server/brandDescriptionCache";

const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are an editorial brand strategist writing concise descriptions for
an interactive WPP website.
Write exactly ONE sentence.
Maximum 14 words.
Explain what makes the selected brand distinct within WPP.
Use a confident, intelligent editorial tone.
Use present tense.
Do not use marketing clichés.
Do not use:
leading,
world-class,
innovative,
revolutionary,
cutting-edge,
best-in-class.
Do not invent facts.
Use only the provided brand context.
Return ONLY the final sentence.
No quotation marks.
No bullets.
No labels.
No additional explanation.`;

const BANNED_PHRASES = [
  "leading",
  "world-class",
  "innovative",
  "revolutionary",
  "cutting-edge",
  "best-in-class",
];

function buildUserPrompt(brand) {
  return `Brand name:
${brand.name}

WPP division:
${brand.division}

Trusted context:
${brand.context}

Instruction:
Write one concise sentence explaining what makes this brand distinct
within WPP. Maximum 14 words. Return only the sentence.`;
}

const SECONDARY_SYSTEM_PROMPT = `You are an editorial brand strategist writing a second, complementary
line for an interactive WPP website, shown directly below a brand's
main description.
Write exactly ONE sentence.
Maximum 14 words.
Focus on the brand's specific discipline, focus area, or formation —
distinct in content from a general positioning statement.
Use a confident, intelligent editorial tone.
Use present tense.
Do not repeat the phrasing of a generic brand tagline.
Do not use marketing clichés.
Do not use:
leading,
world-class,
innovative,
revolutionary,
cutting-edge,
best-in-class.
Do not invent facts.
Use only the provided brand context.
Return ONLY the final sentence.
No quotation marks.
No bullets.
No labels.
No additional explanation.`;

function buildSecondaryUserPrompt(brand) {
  return `Brand name:
${brand.name}

WPP division:
${brand.division}

Trusted context:
${brand.context}

Instruction:
Write one concise sentence about this brand's specific discipline, focus
area, or formation within WPP — different in content from a general
positioning statement. Maximum 14 words. Return only the sentence.`;
}

function cleanCandidate(raw) {
  return raw
    .trim()
    .replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, "")
    .trim();
}

function isValidDescription(candidate) {
  if (!candidate) return false;

  const wordCount = candidate.split(/\s+/).filter(Boolean).length;
  if (wordCount === 0 || wordCount > 14) return false;

  const sentenceEnders = candidate.match(/[.!?]/g) || [];
  if (sentenceEnders.length > 1) return false;
  if (sentenceEnders.length === 1 && !/[.!?]$/.test(candidate)) return false;

  if (/["“”]/.test(candidate)) return false;
  if (/[\n\r]/.test(candidate)) return false;
  if (/^[-*•]/.test(candidate)) return false;
  if (/\*\*|__|##/.test(candidate)) return false;
  if (/^[A-Za-z0-9 &'-]{1,40}:\s/.test(candidate)) return false;
  if (/\d/.test(candidate)) return false;

  const lower = candidate.toLowerCase();
  if (BANNED_PHRASES.some((phrase) => lower.includes(phrase))) return false;

  return true;
}

async function callNvidia(systemPrompt, userPrompt) {
  const response = await fetch(NVIDIA_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 60,
    }),
  });

  if (!response.ok) {
    throw new Error(`NVIDIA request failed with status ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("NVIDIA response missing message content");
  }

  return content;
}

// Calls NVIDIA NIM to produce a short editorial description for `brand`.
// Retries once on an invalid (but successfully received) response; falls
// back to brand.fallback if still invalid. Network/HTTP failures propagate
// so the caller can decide how to fall back (cache, then brand.fallback).
export async function generateBrandDescription(brand) {
  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = buildUserPrompt(brand);

  const firstCandidate = cleanCandidate(await callNvidia(systemPrompt, userPrompt));
  if (isValidDescription(firstCandidate)) {
    brandDescriptionCache.set(brand.id, firstCandidate);
    return firstCandidate;
  }

  const secondCandidate = cleanCandidate(await callNvidia(systemPrompt, userPrompt));
  if (isValidDescription(secondCandidate)) {
    brandDescriptionCache.set(brand.id, secondCandidate);
    return secondCandidate;
  }

  return brand.fallback;
}

// Same contract as generateBrandDescription, but produces a second,
// content-distinct line (discipline/focus/formation) shown below the first.
export async function generateBrandSecondaryDescription(brand) {
  const systemPrompt = SECONDARY_SYSTEM_PROMPT;
  const userPrompt = buildSecondaryUserPrompt(brand);

  const firstCandidate = cleanCandidate(await callNvidia(systemPrompt, userPrompt));
  if (isValidDescription(firstCandidate)) {
    brandSecondaryDescriptionCache.set(brand.id, firstCandidate);
    return firstCandidate;
  }

  const secondCandidate = cleanCandidate(await callNvidia(systemPrompt, userPrompt));
  if (isValidDescription(secondCandidate)) {
    brandSecondaryDescriptionCache.set(brand.id, secondCandidate);
    return secondCandidate;
  }

  return brand.secondaryFallback;
}
