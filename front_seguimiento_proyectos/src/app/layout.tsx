import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PendientesProvider } from '@/contexts/PendientesContext';
import "./globals.css";
import PerfilUsuario from '@/components/Usuario/PerfilUsuario';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proyectos USFX",
  description: "Gestión de proyectos USFX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PendientesProvider>
  {children}
  {/* Global modal for user profile (listens to 'open-profile' event) */}
  <PerfilUsuario />
        </PendientesProvider>
      </body>
    </html>
  );
}
