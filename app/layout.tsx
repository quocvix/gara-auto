import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { GarageStoreProvider } from "@/lib/store/garage-store";
import { AlertDialogProvider } from "@/components/ui/alert-dialog";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const fontSans = Plus_Jakarta_Sans({
    subsets: ["latin", "vietnamese"],
    variable: "--font-sans",
    display: "swap",
});

const fontPlate = Space_Grotesk({
    subsets: ["latin", "vietnamese"],
    variable: "--font-plate",
    display: "swap",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
        { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
    ],
};

const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "DUY.LAMXEDAO.THUDUC",
        template: "%s | DUY.LAMXEDAO.THUDUC",
    },
    description: "Tra cứu thông tin bảo hành xe ô tô",
    applicationName: "DUY.LAMXEDAO.THUDUC",
    authors: [{ name: "DUY.LAMXEDAO.THUDUC" }],
    generator: "Next.js",
    keywords: ["bảo hành ô tô", "gara ô tô", "tra cứu bảo hành", "DUY AUTO", "làm xe dạo thủ đức"],
    creator: "DUY.LAMXEDAO.THUDUC",
    publisher: "DUY.LAMXEDAO.THUDUC",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    icons: {
        icon: [
            { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
            { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/icon.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon.ico", sizes: "any" },
        ],
        shortcut: ["/icon-512.png"],
        apple: [
            { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
            { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
        ],
    },
    openGraph: {
        type: "website",
        locale: "vi_VN",
        url: "/",
        siteName: "DUY.LAMXEDAO.THUDUC",
        title: "DUY.LAMXEDAO.THUDUC",
        description: "Tra cứu thông tin bảo hành xe ô tô",
        images: [
            {
                url: "/icon-512.png",
                width: 512,
                height: 512,
                alt: "DUY.LAMXEDAO.THUDUC Logo",
                type: "image/png",
            },
        ],
    },
    twitter: {
        card: "summary",
        title: "DUY.LAMXEDAO.THUDUC",
        description: "Tra cứu thông tin bảo hành xe ô tô",
        images: ["/icon-512.png"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi" suppressHydrationWarning className={`${fontSans.variable} ${fontPlate.variable}`}>
            <body className="min-h-screen bg-background text-foreground antialiased flex flex-col selection:bg-primary/20 selection:text-primary">
                {/* Skip link for keyboard accessibility */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-lg focus:outline-none"
                >
                    Chuyển đến nội dung chính
                </a>
                <NuqsAdapter>
                    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                        <GarageStoreProvider>
                            <AlertDialogProvider>
                                <main id="main-content" className="flex-1 flex flex-col">
                                    {children}
                                </main>
                                <Toaster richColors position="top-center" closeButton duration={3500} />
                            </AlertDialogProvider>
                        </GarageStoreProvider>
                    </ThemeProvider>
                </NuqsAdapter>
            </body>
        </html>
    );
}
