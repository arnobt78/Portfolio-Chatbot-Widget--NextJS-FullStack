import type { ChatMessage } from "./types";

/**
 * Export chat history as plain text
 */
export function exportChatAsText(messages: ChatMessage[]): string {
  const lines = messages.map((msg) => {
    const role = msg.role === "user" ? "You" : "Assistant";
    const timestamp = msg.timestamp
      ? new Date(msg.timestamp).toLocaleString()
      : "";
    return `[${timestamp}] ${role}: ${msg.content}`;
  });

  return `Chat History Export\n${"=".repeat(50)}\n\n${lines.join("\n\n")}`;
}

/**
 * Export chat history as PDF (using browser print API)
 */
export function exportChatAsPDF(messages: ChatMessage[]): void {
  const content = messages
    .map((msg) => {
      const role = msg.role === "user" ? "You" : "Assistant";
      return `<div style="margin-bottom: 1rem;"><strong>${role}:</strong><br/>${msg.content.replace(/\n/g, "<br/>")}</div>`;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Chat History</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #000; }
        </style>
      </head>
      <body>
        <h1>Chat History</h1>
        ${content}
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => {
      win.print();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }
}

/**
 * Copy chat history to clipboard
 */
export async function copyChatToClipboard(messages: ChatMessage[]): Promise<void> {
  const text = exportChatAsText(messages);
  await navigator.clipboard.writeText(text);
}
