import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Astronomical Events - Space Forecast Portal",
  description:
    "Track meteor showers, eclipses, and celestial alignments with our comprehensive astronomical events calendar.",
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/20" />

      {/* Content */}
      <div className="relative">{children}</div>
    </section>
  );
}
