import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

const services = [
  "Regular Cleaning",
  "Deep Cleaning",
  "Move In/Out Cleaning",
  "Airbnb Cleaning",
  "Office Cleaning",
  "Apartment Cleaning",
  "Window Cleaning",
  "Home Maintenance",
];

const areas = [
  "Sea Point",
  "Camps Bay",
  "Claremont",
  "Green Point",
  "V&A Waterfront",
  "Constantia",
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Social Media Section */}
        <div className="text-center mb-8 pb-8 border-b border-gray-800">
          <p className="text-lg font-semibold text-white mb-4">Follow us! We're friendly</p>
          <div className="flex items-center justify-center gap-6">
            <a
              href="https://facebook.com/shaleancleaning"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/shaloclean"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/shalean_cleaning_services"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Discover Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Discover</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors text-sm"
                >
                  Become a Cleaner
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-white transition-colors text-sm"
                >
                  All Services
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors text-sm"
                >
                  Help
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-white transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors text-sm"
                >
                  Terms & Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Mobile App Column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Our mobile app</h4>
            <p className="text-sm mb-4 text-gray-400">
              Book cleaning services on the go with our mobile app.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
              <a
                href="tel:+27724162547"
                className="hover:text-white transition-colors"
              >
                +27 72 416 2547
              </a>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
              <a
                href="mailto:info@bokkiecleaning.co.za"
                className="hover:text-white transition-colors break-all"
              >
                info@bokkiecleaning.co.za
              </a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
              <span>
                348 Imam Haron Road Lansdowne
                <br />
                Cape Town 7780, Western Cape
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-center md:text-left">
              © {currentYear} Bokkie Cleaning Services. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 text-center md:text-right">
              Professional cleaning services in Cape Town, South Africa
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
