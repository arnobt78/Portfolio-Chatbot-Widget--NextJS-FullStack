import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * POST /api/feedback
 * Handles feedback and issue reports
 * Sends email notification and tracks via Google Analytics
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type: "feedback" | "issue";
      rating?: number;
      comment?: string;
      email?: string;
    };

    const { type, rating, comment, email } = body;

    if (!type || (type === "feedback" && !rating)) {
      return new Response(
        JSON.stringify({ error: "Invalid feedback data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Track via Google Analytics (if available)
    if (typeof window !== "undefined") {
      const win = window as Window;
      if (win.gtag) {
        win.gtag("event", "chatbot_feedback", {
          event_category: "Chatbot",
          event_label: type,
          value: rating || 0,
        });
      }
    }

    // Send email notification (using a service like Resend, SendGrid, etc.)
    // For now, we'll log it. You can integrate with your email service
    const emailData = {
      to: process.env.FEEDBACK_EMAIL || "arnob@example.com",
      subject: `Chatbot ${type === "feedback" ? "Feedback" : "Issue Report"}`,
      text: `
Type: ${type}
${rating ? `Rating: ${rating}/5` : ""}
${comment ? `Comment: ${comment}` : ""}
${email ? `Email: ${email}` : ""}
      `.trim(),
    };

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    console.log("Feedback received:", emailData);

    const origin = req.headers.get('origin');
    const allowedOrigin = origin || '*';
    
    return new Response(
      JSON.stringify({ success: true, message: "Thank you for your feedback!" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Cookie",
        },
      }
    );
  } catch (error) {
    console.error("Feedback error:", error);
    const origin = req.headers.get('origin');
    const allowedOrigin = origin || '*';
    return new Response(
      JSON.stringify({ error: "Failed to submit feedback" }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  const allowedOrigin = origin || '*';
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Cookie",
    },
  });
}
