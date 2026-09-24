import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Garage Service System",
  description: "Customer, vehicle, work order, and inventory management.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
