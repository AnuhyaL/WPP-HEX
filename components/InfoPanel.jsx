"use client";

import { useEffect, useRef, useState } from "react";
import { useBrandDescription } from "@/hooks/useBrandDescription";

const EXIT_MS = 140;

// Left info panel: WPP division, brand name, its AI-generated description,
// and a second, smaller AI-generated line below it. Crossfades between
// brands — the outgoing content stays put and fades out, then the incoming
// content swaps in and fades in — so only one pair of lines is ever
// visible, and the primary line is never left blank. The secondary line is
// simply omitted (not shown as "loading") until it's ready, so the loading
// state never doubles up.
export default function InfoPanel({ activeBrand, nextBrand }) {
  const { description, secondaryDescription, loading } = useBrandDescription(activeBrand, nextBrand);
  const liveText = loading ? "Generating insight…" : description;
  const liveSecondaryText = loading ? "" : secondaryDescription;

  const [shown, setShown] = useState({ brand: activeBrand, text: liveText, secondaryText: liveSecondaryText });
  const [phase, setPhase] = useState("enter");
  const pendingRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (activeBrand.id === shown.brand.id) {
      setShown((prev) =>
        prev.text === liveText && prev.secondaryText === liveSecondaryText
          ? prev
          : { brand: activeBrand, text: liveText, secondaryText: liveSecondaryText }
      );
      return undefined;
    }

    // Active brand changed: keep showing the old content while it exits,
    // then swap to the (possibly still-loading) new brand's content.
    pendingRef.current = { brand: activeBrand, text: liveText, secondaryText: liveSecondaryText };
    setPhase("exit");
    timeoutRef.current = setTimeout(() => {
      setShown(pendingRef.current);
      setPhase("enter");
    }, EXIT_MS);
    return () => clearTimeout(timeoutRef.current);
  }, [activeBrand, liveText, liveSecondaryText, shown.brand.id]);

  return (
    <div className="info-panel">
      <div
        className={`info-panel-content${phase === "exit" ? " info-panel-exit" : " info-panel-enter"}`}
        aria-live="polite"
      >
        <p className="info-panel-division">{shown.brand.division}</p>
        <h2 className="info-panel-name">{shown.brand.name}</h2>
        <p className="info-panel-description">{shown.text}</p>
        {shown.secondaryText ? <p className="info-panel-secondary">{shown.secondaryText}</p> : null}
      </div>
    </div>
  );
}
