/**
 * Paystack payment integration utilities
 */

export interface PaystackConfig {
  publicKey: string;
  amount: number; // in cents (smallest currency unit for ZAR)
  email: string;
  reference: string;
  currency?: string; // Currency code (defaults to ZAR)
  metadata?: Record<string, any>;
  callback_url?: string;
  onClose?: () => void;
}

/**
 * Initialize Paystack payment
 * This will be used on the client side with Paystack inline JS
 */
export function initializePaystack(config: PaystackConfig): void {
  if (typeof window === "undefined") {
    throw new Error("Paystack initialization must be called on the client side");
  }

  // Load Paystack inline JS if not already loaded
  const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paystack script"));
      document.body.appendChild(script);
    });
  };

  loadPaystackScript()
    .then(() => {
      const handler = (window as any).PaystackPop.setup({
        key: config.publicKey,
        amount: config.amount,
        email: config.email,
        ref: config.reference,
        currency: config.currency || "ZAR", // Default to ZAR (South African Rand)
        metadata: config.metadata || {},
        callback: function (response: any) {
          // Payment successful
          console.log("Payment successful:", response);
          if (config.callback_url) {
            // Add reference to callback URL
            const url = new URL(config.callback_url);
            url.searchParams.set("reference", response.reference);
            url.searchParams.set("status", "success");
            window.location.href = url.toString();
          }
        },
        onClose: function () {
          // Handle payment cancellation
          console.log("Payment window closed");
          if (config.onClose) {
            config.onClose();
          } else {
            alert("Payment was cancelled. Please try again.");
          }
        },
      });

      handler.openIframe();
    })
    .catch((error) => {
      console.error("Error loading Paystack:", error);
      alert("Failed to load payment gateway. Please refresh the page and try again.");
    });
}

/**
 * Verify payment on server side
 */
export async function verifyPayment(reference: string, secretKey: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data = await response.json();
    return data.status && data.data.status === "success";
  } catch (error) {
    console.error("Error verifying payment:", error);
    return false;
  }
}
