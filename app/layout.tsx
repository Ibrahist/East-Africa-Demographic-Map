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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@100..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-[#0d1117] text-[#e6edf3]">
        {children}
      </body>
    </html>
  );
}
