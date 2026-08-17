"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { brands, getBrandById } from "@/config/brands";
import BrandScroll from "./BrandScroll";
import InfoPanel from "./InfoPanel";

export default function Hero() {
  const [activeBrandId, setActiveBrandId] = useState(brands[0].id);

  const activeBrand = getBrandById(activeBrandId) ?? brands[0];
  const nextBrand = useMemo(() => {
    const index = brands.findIndex((brand) => brand.id === activeBrand.id);
    return brands[(index + 1) % brands.length];
  }, [activeBrand.id]);

  return (
    <section className="hero">
      {/* Hero video: unchanged across active-brand/description updates —
          it lives outside any state that unmounts or remounts it. */}
      <video
        className="hero-video"
        src="/hero-video.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero-overlay" aria-hidden="true" />

      <Image
        className="hero-logo"
        src="/wpp-logo.png"
        alt="WPP"
        width={2172}
        height={724}
        priority
      />

      <div className="hero-content">
        <InfoPanel activeBrand={activeBrand} nextBrand={nextBrand} />
        <BrandScroll activeBrandId={activeBrand.id} onActiveChange={setActiveBrandId} />
      </div>
    </section>
  );
}
