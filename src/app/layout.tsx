import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AjoSync - Thrift Savings Platform",
  description: "Complete thrift savings platform for Ajo/Esusu groups. Manage contributions, cycles, and payouts with ease.",
  keywords: ["Ajo", "Esusu", "Thrift", "Savings", "Contributions", "Group savings", "Nigeria", "Africa"],
  authors: [{ name: "AjoSync Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "AjoSync - Thrift Savings Platform",
    description: "Complete thrift savings platform for Ajo/Esusu groups",
    siteName: "AjoSync",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${dmSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
