import type { Metadata, Viewport } from "next"
import { Sora, Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
})
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Workforce Attrition Intelligence — HR Analytics",
  description:
    "Interactive HR analytics dashboard for exploring employee attrition, scoring individual attrition risk with a trained logistic-regression model, and browsing the full workforce dataset.",
  keywords: [
    "HR analytics",
    "employee attrition",
    "attrition prediction",
    "workforce intelligence",
    "logistic regression",
    "people analytics",
  ],
  authors: [{ name: "Workforce Attrition Intelligence" }],
  openGraph: {
    title: "Workforce Attrition Intelligence",
    description:
      "Explore workforce attrition signals and predict individual attrition risk.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#0A0F1C",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  )
}
