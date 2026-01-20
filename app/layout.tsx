import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio Chatbot Widget",
  description: "A high-performance RAG chatbot widget for portfolio websites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chatbotUrl = process.env.NEXT_PUBLIC_CHATBOT_URL || 'https://portfolio-chatbot-widget.vercel.app';
  const chatbotTitle = process.env.CHATBOT_TITLE || "Chat Assistant";
  const chatbotGreeting = process.env.CHATBOT_GREETING || "👋 How can I help you today?";
  const chatbotPlaceholder = process.env.CHATBOT_PLACEHOLDER || "Message...";
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.CHATBOT_BASE_URL = "${chatbotUrl}";
              window.CHATBOT_TITLE = ${JSON.stringify(chatbotTitle)};
              window.CHATBOT_GREETING = ${JSON.stringify(chatbotGreeting)};
              window.CHATBOT_PLACEHOLDER = ${JSON.stringify(chatbotPlaceholder)};
            `,
          }}
        />
        {/* Keep vanilla JS widget for external embedding */}
        <script
          src={`${chatbotUrl}/widget.js`}
          async
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          {/* React-based widget for internal use */}
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  );
}
