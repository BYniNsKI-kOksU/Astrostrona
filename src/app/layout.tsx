import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/layout";
import { ThemeProvider, AuthProvider } from "@/components/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Astrostr — Społeczność astronomiczna",
  description:
    "Forum, galeria zdjęć, newsy i nauka — wszystko o astronomii w jednym miejscu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="theme-dark">
      <body className="min-h-screen flex flex-col stars-bg">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
