// Brand configuration for the AI-generated brand description feature.
// The frontend always renders `name` / `division` from this file — the
// model is only ever allowed to produce the `description` /
// `secondaryDescription` sentences.

export const brands = [
  // WPP Creative
  {
    id: "vml",
    name: "VML",
    division: "WPP Creative",
    context:
      "A global creative, commerce and technology agency formed from the merger of VMLY&R and Wunderman Thompson.",
    fallback: "Merges creative, commerce and technology into one connected brand experience.",
    secondaryFallback: "Formed from VMLY&R and Wunderman Thompson to unify end-to-end brand experience.",
  },
  {
    id: "ogilvy",
    name: "Ogilvy",
    division: "WPP Creative",
    context:
      "A global creative agency network founded by David Ogilvy, spanning advertising, PR, customer experience and brand building.",
    fallback: "Creates ideas and experiences that help brands connect meaningfully with people.",
    secondaryFallback: "Spans advertising, PR, brand experience and customer engagement disciplines.",
  },
  {
    id: "burson",
    name: "Burson",
    division: "WPP Creative",
    context:
      "A global communications and public relations firm formed from the merger of BCW and Hill+Knowlton.",
    fallback: "Shapes public opinion and reputation through strategic communications and public relations.",
    secondaryFallback: "Formed from BCW and Hill+Knowlton to shape global communications strategy.",
  },
  {
    id: "akqa",
    name: "AKQA",
    division: "WPP Creative",
    context:
      "A design and innovation agency focused on digital products, services and experiences for global brands.",
    fallback: "Designs digital products and experiences that shape how people interact with brands.",
    secondaryFallback: "Focuses on digital design, products and experiences for global brands.",
  },
  {
    id: "landor",
    name: "Landor",
    division: "WPP Creative",
    context:
      "A brand consulting and design agency specializing in brand strategy, naming and visual identity.",
    fallback: "Builds and evolves brand identities through strategy, naming and design.",
    secondaryFallback: "Specializes in brand strategy, naming and visual identity development.",
  },
  {
    id: "design-bridge-and-partners",
    name: "Design Bridge and Partners",
    division: "WPP Creative",
    context:
      "A branding and design agency known for packaging, identity and brand experience work.",
    fallback: "Crafts distinctive brand identities and packaging through strategic design thinking.",
    secondaryFallback: "Focuses on packaging, identity and brand experience design work.",
  },

  // WPP Media
  {
    id: "mindshare",
    name: "Mindshare",
    division: "WPP Media",
    context:
      "A global media agency focused on media planning, buying and content strategy for brands.",
    fallback: "Plans and buys media that connects brands with audiences across channels.",
    secondaryFallback: "Specializes in media planning, buying and content strategy work.",
  },
  {
    id: "wavemaker",
    name: "Wavemaker",
    division: "WPP Media",
    context:
      "A global media agency focused on media investment, content and technology-driven marketing.",
    fallback: "Combines media investment and technology to help brands grow faster.",
    secondaryFallback: "Focuses on media investment, content and technology-driven marketing strategy.",
  },
  {
    id: "essencemediacom",
    name: "EssenceMediacom",
    division: "WPP Media",
    context:
      "A global media agency formed from the merger of Essence and MediaCom, focused on data-driven marketing.",
    fallback: "Uses data and media expertise to drive measurable brand growth.",
    secondaryFallback: "Formed from Essence and MediaCom to unify data-driven marketing strategy.",
  },

  // WPP Production
  {
    id: "wpp-production",
    name: "WPP Production",
    division: "WPP Production",
    context:
      "WPP's global production capability, providing content production services across film, digital and print for WPP agencies and clients.",
    fallback: "Produces content at scale across film, digital and print for global brands.",
    secondaryFallback: "Provides production services across film, digital and print formats.",
  },

  // WPP Enterprise Solutions
  {
    id: "wpp-enterprise-solutions",
    name: "WPP Enterprise Solutions",
    division: "WPP Enterprise Solutions",
    context:
      "WPP's practice focused on enterprise technology, data and consulting services for large-scale business transformation.",
    fallback: "Delivers enterprise technology and data solutions for large-scale business transformation.",
    secondaryFallback: "Focuses on enterprise technology, data and consulting for transformation.",
  },

  // WPP Open
  {
    id: "wpp-open",
    name: "WPP Open",
    division: "WPP Open",
    context:
      "WPP's AI-powered marketing operating system connecting data, creative and media planning tools.",
    fallback: "Connects data, creative and media planning in one AI-powered platform.",
    secondaryFallback: "Connects agency data, creative tools and media planning systems.",
  },
];

export function getBrandById(id) {
  return brands.find((brand) => brand.id === id);
}
