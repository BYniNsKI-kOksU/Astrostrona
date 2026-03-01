import type { Metadata } from "next";
import { Navbar, Footer } from "@/components/layout";
import { ThemeProvider, AuthProvider, PostsProvider } from "@/components/providers";
import { ToastProvider } from "@/components/ui";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Astrofor — Społeczność astronomiczna",
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="min-h-screen flex flex-col stars-bg">
        <ThemeProvider>
          <AuthProvider>
            <PostsProvider>
              <ToastProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </ToastProvider>
            </PostsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
