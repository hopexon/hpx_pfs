import type { Metadata } from "next";
import "./global.css";
import GlobalHeader from "@/components/common/GlobalHeader";
import GlobalFooter from "@/components/common/GlobalFooter";
import ToTopBtn from "@/components/common/ToTopBtn";

export const metadata: Metadata = {
  // metadataBase: new URL(""),
  robots: "noindex, nofollow",
  title: {
    default: "Hopexon Portfolio",
    template: "%s | Hopexon Portfolio",
  },
  description: "A static portfolio generated with Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <GlobalHeader />
        <main>
          {children}
          <ToTopBtn />
        </main>
        <GlobalFooter />
      </body>
    </html>
  );
}
