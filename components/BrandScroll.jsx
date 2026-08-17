"use client";

import { useEffect, useRef } from "react";
import { brands } from "@/config/brands";

const divisions = [...new Set(brands.map((brand) => brand.division))];

// Vertical, keyboard-operable list of brand cards. On scroll, whichever
// card's center sits closest to the scroll container's vertical center is
// reported as the active brand. (An IntersectionObserver band was tried
// first, but a band wide enough to reliably catch a card also reliably
// catches its neighbors, so distance-to-center is used instead.) This only
// runs in response to real scroll events — including the ones a smooth
// scrollIntoView() produces — so it never overrides the initial brand
// picked by React state before the user has scrolled.
export default function BrandScroll({ activeBrandId, onActiveChange }) {
  const containerRef = useRef(null);
  const cardRefs = useRef(new Map());
  const rafRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateActiveFromScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      let closestId = null;
      let closestDistance = Infinity;
      cardRefs.current.forEach((el, brandId) => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - centerY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = brandId;
        }
      });

      if (closestId) onActiveChange(closestId);
    };

    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateActiveFromScroll();
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onActiveChange]);

  return (
    <nav
      ref={containerRef}
      className="brand-scroll"
      aria-label="WPP brands"
      role="listbox"
    >
      {divisions.map((division) => (
        <div key={division} className="brand-scroll-group">
          <p className="brand-scroll-division">{division}</p>
          {brands
            .filter((brand) => brand.division === division)
            .map((brand) => {
              const isActive = brand.id === activeBrandId;
              return (
                <button
                  key={brand.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(brand.id, el);
                    else cardRefs.current.delete(brand.id);
                  }}
                  type="button"
                  data-brand-id={brand.id}
                  role="option"
                  aria-selected={isActive}
                  aria-current={isActive ? "true" : undefined}
                  className={`brand-card${isActive ? " brand-card-active" : ""}`}
                  onFocus={() => onActiveChange(brand.id)}
                  onClick={(event) => {
                    onActiveChange(brand.id);
                    event.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  {brand.name}
                </button>
              );
            })}
        </div>
      ))}
    </nav>
  );
}
