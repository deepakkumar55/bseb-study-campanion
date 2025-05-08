import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
  subsets: ["latin"],
  preload: true,
});

export const metadata: Metadata = {
  title: "BSEB Study Companion | Ultimate Class 12 Science Platform",
  description: "Elevate your BSEB Class 12 Science preparation with previous year papers, tests, quizzes, notes, and a supportive community.",
  keywords: "BSEB, Class 12, Science, Study Companion, Exam Preparation, Bihar Board, Physics, Chemistry, Mathematics, Biology, English",
  authors: [{ name: "BSEB Study Companion Team" }],
  category: "Education",
  applicationName: "BSEB Study Companion",
  creator: "BSEB Study Companion",
  publisher: "BSEB Study Companion",
  metadataBase: new URL("https://bseb.thecampusCoders.com"),
  openGraph: {
    title: "BSEB Study Companion | Ultimate Class 12 Science Platform",
    description: "Elevate your BSEB Class 12 Science preparation with our comprehensive platform",
    url: "https://bseb.thecampusCoders.com",
    siteName: "BSEB Study Companion",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BSEB Study Companion Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BSEB Study Companion | Ultimate Class 12 Science Platform",
    description: "Elevate your BSEB Class 12 Science preparation with our comprehensive platform",
    images: ["/twitter-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#4f46e5",
  verification: {
    google: "google-site-verification=your-verification-code",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preload critical assets */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for common third-party domains */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Prefetch important pages that users might navigate to */}
        <link rel="prefetch" href="/" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        
        {/* Analytics script with delayed loading */}
        <Script
          strategy="lazyOnload"
          id="analytics"
          dangerouslySetInnerHTML={{
            __html: `
              // Analytics code here - This will load only after the page is fully loaded
              console.log('Analytics loaded');
            `,
          }}
        />
      </body>
    </html>
  );
}
