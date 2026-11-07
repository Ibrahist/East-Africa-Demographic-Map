import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "East Africa Demographic Map | Administrative Hierarchy Choropleth",
  description:
    "Interactive choropleth web map visualizing administrative hierarchies and public census demographics across Kenya, Tanzania, Uganda, Rwanda, and Burundi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        {children}
      </body>
    </html>
  );
}

