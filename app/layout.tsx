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
        {/* CRITICAL: This script MUST be FIRST and runs before ANY CSS or rendering */}
        {/* It reads localStorage and sets theme immediately to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !(function() {
                var stored, theme, isDark, bgColor, textColor, html;
                try {
                  stored = localStorage.getItem('chatbot-theme');
                  theme = (stored === 'light' || stored === 'dark') ? stored : 'dark';
                  isDark = theme === 'dark';
                  bgColor = isDark ? '#0a0a0a' : '#ffffff';
                  textColor = isDark ? '#ededed' : '#171717';
                } catch (e) {
                  isDark = true;
                  bgColor = '#0a0a0a';
                  textColor = '#ededed';
                }
                
                html = document.documentElement;
                
                // Set CSS variables and inline styles FIRST (before class manipulation)
                // This prevents ANY flash by setting colors immediately
                html.style.setProperty('--background', bgColor, 'important');
                html.style.setProperty('--foreground', textColor, 'important');
                html.style.setProperty('background-color', bgColor, 'important');
                html.style.setProperty('color', textColor, 'important');
                
                // THEN remove/add dark class (after colors are set)
                html.classList.remove('dark');
                if (isDark) {
                  html.classList.add('dark');
                }
                
                // Set body styles immediately if body exists
                if (document.body) {
                  document.body.style.setProperty('background-color', bgColor, 'important');
                  document.body.style.setProperty('color', textColor, 'important');
                }
                
                // Watch for body and set immediately (synchronous check)
                (function checkBody() {
                  if (document.body) {
                    document.body.style.setProperty('background-color', bgColor, 'important');
                    document.body.style.setProperty('color', textColor, 'important');
                  } else {
                    setTimeout(checkBody, 0);
                  }
                })();
                
                // Re-enable transitions after page load
                setTimeout(function() {
                  html.classList.add('loaded');
                }, 150);
              })();
            `,
          }}
        />
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
        {/* Load widget styles for React widget */}
        <link rel="stylesheet" href="/styles.css" />
        {/* Vanilla JS widget for external embedding only - disabled when using React widget */}
        {/* Uncomment this line when embedding on external sites */}
        {/* <script src={`${chatbotUrl}/widget.js`} async></script> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
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
