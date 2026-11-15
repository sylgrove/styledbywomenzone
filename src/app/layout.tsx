import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Styled By Womenzone | Fashion, Jewellery, Beauty & More",
    template: "%s | Styled By Womenzone",
  },
  description:
    "Discover fashion, jewellery, beauty favourites and handcrafted finds from Jahan's Thread, WomenZone, Pretty Finds and Shyamol.",
  applicationName: "Styled By Womenzone",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
