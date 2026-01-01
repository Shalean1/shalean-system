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
      // Check if PaystackPop is already available
      if ((window as any).PaystackPop) {
        resolve();
        return;
      }

      // Check if script is already in the DOM
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]') as HTMLScriptElement;
      if (existingScript) {
        // If script is complete, check if PaystackPop is available
        if (existingScript.complete || existingScript.readyState === 'complete') {
          // Wait a bit for PaystackPop to initialize
          const checkInterval = setInterval(() => {
            if ((window as any).PaystackPop) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 50);

          // Timeout after 3 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            if ((window as any).PaystackPop) {
              resolve();
            } else {
              reject(new Error("Paystack script loaded but PaystackPop is not available. Please refresh the page."));
            }
          }, 3000);
          return;
        }

        // Script is loading, wait for it
        existingScript.addEventListener('load', () => {
          setTimeout(() => {
            if ((window as any).PaystackPop) {
              resolve();
            } else {
              reject(new Error("Paystack script loaded but PaystackPop is not available. Please refresh the page."));
            }
          }, 100);
        }, { once: true });
        
        existingScript.addEventListener('error', () => {
          reject(new Error("Failed to load Paystack script. Please check your internet connection and try again."));
        }, { once: true });
        return;
      }

      // Create and load new script
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        // Wait a moment for PaystackPop to initialize after script loads
        setTimeout(() => {
          if ((window as any).PaystackPop) {
            resolve();
          } else {
            reject(new Error("Paystack script loaded but PaystackPop is not available. Please refresh the page."));
          }
        }, 100);
      };
      script.onerror = () => {
        reject(new Error("Failed to load Paystack script. Please check your internet connection and try again."));
      };
      document.body.appendChild(script);
    });
  };

  loadPaystackScript()
    .then(() => {
      // Ensure amount is a valid integer (Paystack requirement)
      const amount = Math.round(config.amount);
      
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error(`Invalid payment amount: ${amount}. Amount must be a positive integer.`);
      }

      const handler = (window as any).PaystackPop.setup({
        key: config.publicKey,
        amount: amount,
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
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to load payment gateway. Please refresh the page and try again.";
      alert(errorMessage);
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

/**
 * Verify Paystack webhook signature
 * Paystack signs webhooks using HMAC SHA512 with your secret key
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secretKey: string
): boolean {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");
  
  return hash === signature;
}
