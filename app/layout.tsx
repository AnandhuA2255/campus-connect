import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusConnect | Smart Event Hub",
  description: "The all-in-one platform for student leaders and university administrators to orchestrate high-impact campus experiences.",
  keywords: "campus events, student portal, university, hackathon, leaderboard, team builder",
  openGraph: {
    title: "CampusConnect | Smart Event Hub",
    description: "Empowering campus life through seamless events.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
