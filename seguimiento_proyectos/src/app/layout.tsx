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
  title: "CloudIt",
  description: "App de guardado de archivos en la nube",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins antialiased`}>
                <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}