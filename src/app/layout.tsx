import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Optimize font loading
const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
  preload: true,
  fallback: ["system-ui", "arial"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  display: "swap",
  subsets: ["latin"],
  preload: true,
  fallback: ["monospace"]
});

// Enhanced metadata for better SEO
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
  alternates: {
    canonical: 'https://bseb.thecampusCoders.com',
    languages: {
      'en-US': 'https://bseb.thecampusCoders.com/en-US',
      'hi-IN': 'https://bseb.thecampusCoders.com/hi-IN',
    },
  },
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
    maximumScale: 5, // Allow zooming for accessibility
  },
  themeColor: "#4f46e5",
  verification: {
    google: "google-site-verification=your-verification-code",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// Add security headers
export const headers = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://www.google-analytics.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com;",
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
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
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Prefetch important pages that users might navigate to */}
        <link rel="prefetch" href="/" />
        
        {/* Add favicon tags */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        
        {/* Production-ready Google Analytics */}
        <Script
          strategy="afterInteractive"
          id="gtag-init"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YOUR-MEASUREMENT-ID', {
                page_path: window.location.pathname,
                cookie_flags: 'SameSite=None;Secure'
              });
            `,
          }}
        />
        
        {/* Google Tag Manager */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-YOUR-ID');
            `,
          }}
        />
        
        {/* Error monitoring */}
        <Script
          strategy="afterInteractive"
          id="error-tracking"
          dangerouslySetInnerHTML={{
            __html: `
              window.onerror = function(message, source, lineno, colno, error) {
                // Send error to your monitoring service
                console.error('Error captured:', { message, source, lineno, colno, error });
                return false;
              };
            `,
          }}
        />
      </body>
    </html>
  );
}
