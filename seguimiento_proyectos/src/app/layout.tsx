import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from '../context/AuthContext';
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "CloudIt - Panel del Docente",
  description: "Sistema de gestión de proyectos para docentes",
  openGraph: {
    title: "CloudIt - Panel del Docente",
    description: "Sistema de gestión de proyectos para docentes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudIt - Panel del Docente",
    description: "Sistema de gestión de proyectos para docentes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}