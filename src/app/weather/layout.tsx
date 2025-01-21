import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Space Weather - Space Forecast Portal",
  description:
    "Monitor solar flares, cosmic radiation, and planetary conditions in real-time.",
};

export default function WeatherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />

      {/* Content */}
      <div className="relative">{children}</div>
    </section>
  );
}
