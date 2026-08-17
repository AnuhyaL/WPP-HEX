"use client";

import { useEffect, useRef, useState } from "react";

// Module-level so the cache and in-flight requests survive across
// component instances/re-renders for the life of the page.
const descriptionCache = new Map();
const inFlightRequests = new Map();

function fetchDescriptions(brandId) {
  if (descriptionCache.has(brandId)) {
    return Promise.resolve(descriptionCache.get(brandId));
  }
  if (inFlightRequests.has(brandId)) {
    return inFlightRequests.get(brandId);
  }

  const request = fetch("/api/brand-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandId }),
  })
    .then((res) => res.json())
    .then((data) => {
      const result = {
        description: data && typeof data.description === "string" ? data.description : "",
        secondaryDescription: data && typeof data.secondaryDescription === "string" ? data.secondaryDescription : "",
      };
      if (result.description) descriptionCache.set(brandId, result);
      return result;
    })
    .finally(() => {
      inFlightRequests.delete(brandId);
    });

  inFlightRequests.set(brandId, request);
  return request;
}

// Fetches (and caches) the AI-generated description + secondary description
// for `activeBrand`, discarding any response that resolves after a newer
// brand became active. Optionally prefetches `nextBrand`'s descriptions in
// the background.
export function useBrandDescription(activeBrand, nextBrand) {
  const [state, setState] = useState(() => ({
    description: descriptionCache.get(activeBrand.id)?.description ?? null,
    secondaryDescription: descriptionCache.get(activeBrand.id)?.secondaryDescription ?? null,
    loading: !descriptionCache.has(activeBrand.id),
  }));

  const latestRequestedId = useRef(activeBrand.id);

  useEffect(() => {
    latestRequestedId.current = activeBrand.id;

    const cached = descriptionCache.get(activeBrand.id);
    if (cached) {
      setState({ description: cached.description, secondaryDescription: cached.secondaryDescription, loading: false });
      return;
    }

    setState({ description: null, secondaryDescription: null, loading: true });

    fetchDescriptions(activeBrand.id)
      .then((result) => {
        if (latestRequestedId.current !== activeBrand.id) return;
        setState({
          description: result.description || activeBrand.fallback,
          secondaryDescription: result.secondaryDescription || activeBrand.secondaryFallback,
          loading: false,
        });
      })
      .catch(() => {
        if (latestRequestedId.current !== activeBrand.id) return;
        setState({
          description: activeBrand.fallback,
          secondaryDescription: activeBrand.secondaryFallback,
          loading: false,
        });
      });
  }, [activeBrand]);

  useEffect(() => {
    if (!nextBrand) return;
    if (descriptionCache.has(nextBrand.id) || inFlightRequests.has(nextBrand.id)) return;
    fetchDescriptions(nextBrand.id).catch(() => {});
  }, [nextBrand]);

  return state;
}
