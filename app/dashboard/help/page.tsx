import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HelpCircle, BookOpen, CreditCard, Coins, Ticket, Calendar, User, Mail, Phone, MessageCircle } from "lucide-react";
import FAQAccordion from "@/components/dashboard/FAQAccordion";

export default async function HelpPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  const faqCategories = [
    {
      title: "Bookings",
      icon: Calendar,
      questions: [
        {
          question: "How do I book a cleaning service?",
          answer: "You can book a cleaning service by visiting our booking page and selecting your preferred service type (Standard, Deep Clean, Move In/Out, or Airbnb). Follow the step-by-step process to select your property details, schedule, and preferred cleaner. You can complete your booking without logging in, but creating an account allows you to manage your bookings easily."
        },
        {
          question: "What cleaning services do you offer?",
          answer: "We offer four main service types: Standard Cleaning (regular maintenance), Deep Cleaning (thorough cleaning), Move In/Out Cleaning (for moving), and Airbnb Cleaning (for short-term rentals). Each service can be customized with extras like inside fridge cleaning, inside oven cleaning, and more."
        },
        {
          question: "Can I choose a specific cleaner?",
          answer: "Yes! During the booking process, you can select a preferred cleaner from our team, or choose 'No preference' and we'll assign the best available cleaner for your booking."
        },
        {
          question: "What cleaning frequencies are available?",
          answer: "You can book one-time cleanings or set up recurring services with Weekly, Bi-Weekly, or Monthly frequencies. Recurring bookings receive automatic discounts."
        },
        {
          question: "How far in advance can I book?",
          answer: "You can book cleaning services up to several weeks in advance. We recommend booking at least 24-48 hours ahead to ensure availability, especially for specific cleaner preferences."
        },
        {
          question: "Can I reschedule my booking?",
          answer: "Yes! You can reschedule your booking from the booking details page. Simply click the 'Reschedule' button and select a new date and time that works for you."
        },
        {
          question: "What is your cancellation policy?",
          answer: "You can cancel your booking from the booking details page. Cancellations made at least 24 hours before the scheduled service time are eligible for a full refund. Cancellations made less than 24 hours before may be subject to a cancellation fee."
        }
      ]
    },
    {
      title: "Payments",
      icon: CreditCard,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept credit/debit cards through our secure payment gateway (Paystack) and BokCred credits. Card payments are processed instantly, while EFT deposits require manual verification before credits are added to your account."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, absolutely! We use Paystack, a PCI DSS compliant payment processor, to handle all card payments. We never store your full card details on our servers. All transactions are encrypted and secure."
        },
        {
          question: "When do I pay for my booking?",
          answer: "Payment is required at the time of booking. You can pay immediately using a card or use your BokCred credits balance if you have sufficient funds."
        },
        {
          question: "Can I add a tip for my cleaner?",
          answer: "Yes! You can add a tip amount during the booking process. Tips are paid directly to your cleaner and are a great way to show appreciation for excellent service."
        },
        {
          question: "What if my payment fails?",
          answer: "If your payment fails, your booking will not be confirmed. Please check your payment method and try again. If you continue to experience issues, contact our support team for assistance."
        },
        {
          question: "Do you offer refunds?",
          answer: "Refunds are available for cancelled bookings according to our cancellation policy. Refunds are processed to the original payment method within 5-7 business days."
        }
      ]
    },
    {
      title: "BokCred Credits",
      icon: Coins,
      questions: [
        {
          question: "What are BokCred credits?",
          answer: "BokCred credits are a prepaid balance system that allows you to purchase credits and use them to pay for bookings instantly. Credits never expire and can be purchased in amounts from R20 to R5000."
        },
        {
          question: "How do I purchase BokCred credits?",
          answer: "Visit the BokCred page in your dashboard, select the amount you want to purchase, and complete the payment. Card payments are instant, while EFT deposits require manual verification (usually within 1-2 business days)."
        },
        {
          question: "Can I use credits to pay for bookings?",
          answer: "Yes! When booking a service, you can choose to pay with BokCred credits if you have sufficient balance. Credits provide instant payment without needing to enter card details each time."
        },
        {
          question: "Do credits expire?",
          answer: "No, BokCred credits never expire. You can use them anytime for future bookings."
        },
        {
          question: "How do I check my credit balance?",
          answer: "Your current BokCred balance is displayed on the BokCred page in your dashboard. You can also view your complete transaction history there."
        },
        {
          question: "What happens if I don't have enough credits?",
          answer: "If your credit balance is insufficient for a booking, you can either purchase more credits or pay the remaining amount using a card. You can also combine payment methods."
        }
      ]
    },
    {
      title: "Vouchers",
      icon: Ticket,
      questions: [
        {
          question: "What are vouchers?",
          answer: "Vouchers are prepaid cleaning service credits that can be purchased and used for bookings. They make great gifts and can be redeemed when booking services."
        },
        {
          question: "How do I purchase a voucher?",
          answer: "Visit the Vouchers page in your dashboard to see available vouchers for purchase. Select the voucher you want and complete the payment."
        },
        {
          question: "How do I redeem a voucher?",
          answer: "When booking a service, you can apply your voucher during the checkout process. The voucher value will be deducted from your total amount."
        },
        {
          question: "Can I see my voucher usage history?",
          answer: "Yes! The Vouchers page shows all your vouchers, including their status and usage history."
        },
        {
          question: "Do vouchers expire?",
          answer: "Voucher expiration dates vary by voucher type. Check your voucher details for specific expiration information."
        }
      ]
    },
    {
      title: "Account & Profile",
      icon: User,
      questions: [
        {
          question: "How do I update my profile information?",
          answer: "Visit the Profile page in your dashboard to update your name, email, phone number, and other personal information."
        },
        {
          question: "How do I change my password?",
          answer: "You can change your password from your account settings. If you've forgotten your password, use the 'Forgot Password' link on the login page."
        },
        {
          question: "Can I have multiple locations saved?",
          answer: "Yes! Visit the Locations page in your dashboard to add, edit, and manage multiple service addresses. This makes booking faster for recurring cleanings."
        },
        {
          question: "How do I view my booking history?",
          answer: "All your bookings are available on the Bookings page in your dashboard. You can filter by status (upcoming, completed, cancelled) and view detailed information for each booking."
        },
        {
          question: "What is the Refer & Earn program?",
          answer: "Refer & Earn allows you to share your unique referral code with friends. When they sign up and complete their first booking, you both earn R50 in BokCred credits. Visit the Refer & Earn page to get your code and start sharing!"
        }
      ]
    },
    {
      title: "General",
      icon: HelpCircle,
      questions: [
        {
          question: "What areas do you service?",
          answer: "We currently service various areas. Please check our booking page or contact us to confirm if we service your location."
        },
        {
          question: "What should I do to prepare for my cleaning?",
          answer: "We recommend tidying up personal items and clearing surfaces to allow our cleaners to focus on deep cleaning. You can also add special instructions during booking for specific areas or preferences."
        },
        {
          question: "Do I need to be home during the cleaning?",
          answer: "No, you don't need to be home. Many customers provide access instructions or a key. However, you're welcome to be present if you prefer."
        },
        {
          question: "What if I'm not satisfied with the cleaning?",
          answer: "We strive for 100% satisfaction. If you're not happy with the service, please contact us within 24 hours and we'll arrange a re-clean or discuss a resolution."
        },
        {
          question: "How do I rate my cleaner?",
          answer: "After your cleaning is completed, you can rate your cleaner from the booking details page. Your feedback helps us maintain high service standards."
        },
        {
          question: "Can I rebook a previous service?",
          answer: "Yes! From any completed booking, you can click 'Rebook' to quickly create a new booking with the same service details and preferences."
        }
      ]
    }
  ];

  return (
    <div className="py-8 md:py-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Help & Support
              </h1>
              <p className="text-base md:text-lg text-gray-600">
                Find answers to frequently asked questions and get the support you need
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/bookings"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <Calendar className="w-6 h-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 text-sm">My Bookings</h3>
            <p className="text-xs text-gray-600 mt-1">View all bookings</p>
          </Link>
          <Link
            href="/dashboard/shalcred"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-yellow-300 hover:shadow-md transition-all group"
          >
            <Coins className="w-6 h-6 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 text-sm">BokCred</h3>
            <p className="text-xs text-gray-600 mt-1">Manage credits</p>
          </Link>
          <Link
            href="/dashboard/vouchers"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <Ticket className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 text-sm">Vouchers</h3>
            <p className="text-xs text-gray-600 mt-1">View vouchers</p>
          </Link>
          <Link
            href="/dashboard/contact"
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-green-300 hover:shadow-md transition-all group"
          >
            <Mail className="w-6 h-6 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 text-sm">Contact Us</h3>
            <p className="text-xs text-gray-600 mt-1">Get in touch</p>
          </Link>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {faqCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-gray-700" />
                    <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <FAQAccordion questions={category.questions} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Still Need Help?</h2>
          </div>
          <p className="text-gray-700 mb-6">
            Can't find what you're looking for? Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </Link>
            <a
              href="mailto:info@bokkiecleaning.co.za"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </a>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Email Support</p>
                  <p>info@bokkiecleaning.co.za</p>
                  <p className="text-xs text-gray-600 mt-1">We typically respond within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Phone Support</p>
                  <p>Available during business hours</p>
                  <p className="text-xs text-gray-600 mt-1">Monday - Friday, 9 AM - 5 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
