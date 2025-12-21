"use client";

import { useState, useEffect } from "react";
import { getAllPopularServices, PopularService } from "@/app/actions/popular-services";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  DollarSign,
  Home,
  Calendar,
  Settings,
  Info,
  Check,
  X,
} from "lucide-react";

interface ServiceCheck {
  category: string;
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string[];
}

interface ServiceTypePricing {
  service_type: string;
  service_name: string;
  base_price: number;
  is_active: boolean;
}

interface AdditionalService {
  service_id: string;
  name: string;
  price_modifier: number;
  is_active: boolean;
}

interface FrequencyOption {
  frequency_id: string;
  name: string;
  discount_percentage: number;
  is_active: boolean;
}

interface RoomPricing {
  service_type: string;
  room_type: "bedroom" | "bathroom";
  price_per_room: number;
}

export default function CheckServicesPage() {
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<ServiceCheck[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [serviceTypePricing, setServiceTypePricing] = useState<ServiceTypePricing[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [frequencyOptions, setFrequencyOptions] = useState<FrequencyOption[]>([]);
  const [roomPricing, setRoomPricing] = useState<RoomPricing[]>([]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch popular services
      const popular = await getAllPopularServices();
      setPopularServices(popular);

      // Fetch all service type pricing (including inactive for validation)
      const { data: pricingData } = await supabase
        .from("service_type_pricing")
        .select("*")
        .order("display_order", { ascending: true });
      setServiceTypePricing(pricingData || []);

      // Fetch all additional services (including inactive)
      const { data: extrasData } = await supabase
        .from("additional_services")
        .select("*")
        .order("display_order", { ascending: true });
      setAdditionalServices(extrasData || []);

      // Fetch all frequency options (including inactive)
      const { data: frequencyData } = await supabase
        .from("frequency_options")
        .select("*")
        .order("display_order", { ascending: true });
      setFrequencyOptions(frequencyData || []);

      // Fetch all room pricing
      const { data: roomData } = await supabase
        .from("room_pricing")
        .select("*")
        .eq("is_active", true);
      setRoomPricing(roomData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const performChecks = () => {
    const newChecks: ServiceCheck[] = [];

    // Check 1: Popular Services
    const activePopularServices = popularServices.filter((s) => s.is_active);
    if (activePopularServices.length === 0) {
      newChecks.push({
        category: "Popular Services",
        status: "fail",
        message: "No active popular services found",
        details: ["At least one popular service should be active for the homepage"],
      });
    } else if (activePopularServices.length < 3) {
      newChecks.push({
        category: "Popular Services",
        status: "warning",
        message: `Only ${activePopularServices.length} active popular service(s)`,
        details: ["Consider having at least 3-4 active services for better user experience"],
      });
    } else {
      newChecks.push({
        category: "Popular Services",
        status: "pass",
        message: `${activePopularServices.length} active popular service(s) configured`,
        details: activePopularServices.map((s) => `${s.name} (${s.slug})`),
      });
    }

    // Check 2: Service Type Pricing
    const activeServiceTypes = serviceTypePricing.filter((s) => s.is_active);
    const expectedServiceTypes = ["standard", "deep", "move-in-out", "airbnb", "office", "holiday"];
    const configuredTypes = activeServiceTypes.map((s) => s.service_type);
    const missingTypes = expectedServiceTypes.filter((type) => !configuredTypes.includes(type));

    if (activeServiceTypes.length === 0) {
      newChecks.push({
        category: "Service Type Pricing",
        status: "fail",
        message: "No service type pricing configured",
        details: ["Service pricing is required for bookings to work"],
      });
    } else if (missingTypes.length > 0) {
      newChecks.push({
        category: "Service Type Pricing",
        status: "warning",
        message: `Missing pricing for: ${missingTypes.join(", ")}`,
        details: [
          `Configured: ${configuredTypes.join(", ")}`,
          `Missing: ${missingTypes.join(", ")}`,
        ],
      });
    } else {
      newChecks.push({
        category: "Service Type Pricing",
        status: "pass",
        message: `All ${activeServiceTypes.length} service types have pricing configured`,
        details: activeServiceTypes.map(
          (s) => `${s.service_name}: R${s.base_price.toFixed(2)}`
        ),
      });
    }

    // Check 3: Base Prices Validation
    const invalidPrices = activeServiceTypes.filter((s) => s.base_price <= 0);
    if (invalidPrices.length > 0) {
      newChecks.push({
        category: "Price Validation",
        status: "fail",
        message: `${invalidPrices.length} service(s) have invalid base prices`,
        details: invalidPrices.map((s) => `${s.service_name}: R${s.base_price}`),
      });
    } else {
      newChecks.push({
        category: "Price Validation",
        status: "pass",
        message: "All service base prices are valid",
      });
    }

    // Check 4: Additional Services
    const activeExtras = additionalServices.filter((s) => s.is_active);
    if (activeExtras.length === 0) {
      newChecks.push({
        category: "Additional Services",
        status: "warning",
        message: "No additional services configured",
        details: ["Additional services enhance booking options"],
      });
    } else {
      const invalidExtras = activeExtras.filter((s) => s.price_modifier < 0);
      if (invalidExtras.length > 0) {
        newChecks.push({
          category: "Additional Services",
          status: "warning",
          message: `${invalidExtras.length} additional service(s) have negative prices`,
          details: invalidExtras.map((s) => `${s.name}: R${s.price_modifier}`),
        });
      } else {
        newChecks.push({
          category: "Additional Services",
          status: "pass",
          message: `${activeExtras.length} additional service(s) configured`,
          details: activeExtras.slice(0, 5).map((s) => `${s.name}: R${s.price_modifier}`),
        });
      }
    }

    // Check 5: Frequency Options
    const activeFrequencies = frequencyOptions.filter((f) => f.is_active);
    const expectedFrequencies = ["one-time", "weekly", "bi-weekly", "monthly"];
    const configuredFrequencies = activeFrequencies.map((f) => f.frequency_id);
    const missingFrequencies = expectedFrequencies.filter(
      (freq) => !configuredFrequencies.includes(freq)
    );

    if (activeFrequencies.length === 0) {
      newChecks.push({
        category: "Frequency Options",
        status: "fail",
        message: "No frequency options configured",
        details: ["Frequency options are required for recurring bookings"],
      });
    } else if (missingFrequencies.length > 0) {
      newChecks.push({
        category: "Frequency Options",
        status: "warning",
        message: `Missing frequency options: ${missingFrequencies.join(", ")}`,
        details: [
          `Configured: ${configuredFrequencies.join(", ")}`,
          `Missing: ${missingFrequencies.join(", ")}`,
        ],
      });
    } else {
      newChecks.push({
        category: "Frequency Options",
        status: "pass",
        message: `All ${activeFrequencies.length} frequency options configured`,
        details: activeFrequencies.map(
          (f) => `${f.name}: ${f.discount_percentage}% discount`
        ),
      });
    }

    // Check 6: Room Pricing
    const serviceTypesWithRoomPricing = new Set(roomPricing.map((r) => r.service_type));
    const expectedServiceTypesForRooms = ["standard", "deep", "move-in-out"];
    const missingRoomPricing = expectedServiceTypesForRooms.filter(
      (type) => !serviceTypesWithRoomPricing.has(type)
    );

    if (roomPricing.length === 0) {
      newChecks.push({
        category: "Room Pricing",
        status: "fail",
        message: "No room pricing configured",
        details: ["Room pricing is required for bedroom/bathroom calculations"],
      });
    } else if (missingRoomPricing.length > 0) {
      newChecks.push({
        category: "Room Pricing",
        status: "warning",
        message: `Missing room pricing for: ${missingRoomPricing.join(", ")}`,
        details: [
          `Configured for: ${Array.from(serviceTypesWithRoomPricing).join(", ")}`,
          `Missing for: ${missingRoomPricing.join(", ")}`,
        ],
      });
    } else {
      const bedroomPrices = roomPricing.filter((r) => r.room_type === "bedroom");
      const bathroomPrices = roomPricing.filter((r) => r.room_type === "bathroom");
      newChecks.push({
        category: "Room Pricing",
        status: "pass",
        message: "Room pricing configured for all required service types",
        details: [
          `Bedroom pricing: ${bedroomPrices.length} service type(s)`,
          `Bathroom pricing: ${bathroomPrices.length} service type(s)`,
        ],
      });
    }

    // Check 7: Slug Uniqueness
    const slugs = popularServices.map((s) => s.slug);
    const duplicateSlugs = slugs.filter(
      (slug, index) => slugs.indexOf(slug) !== index
    );
    if (duplicateSlugs.length > 0) {
      newChecks.push({
        category: "Slug Validation",
        status: "fail",
        message: `Duplicate slugs found: ${[...new Set(duplicateSlugs)].join(", ")}`,
        details: ["Each service must have a unique slug"],
      });
    } else {
      newChecks.push({
        category: "Slug Validation",
        status: "pass",
        message: "All service slugs are unique",
      });
    }

    // Check 8: Display Order
    const servicesWithOrder = popularServices.filter((s) => s.display_order > 0);
    if (servicesWithOrder.length < popularServices.length) {
      newChecks.push({
        category: "Display Order",
        status: "warning",
        message: `${popularServices.length - servicesWithOrder.length} service(s) have display_order = 0`,
        details: ["Services should have proper display order for consistent sorting"],
      });
    } else {
      newChecks.push({
        category: "Display Order",
        status: "pass",
        message: "All services have display order configured",
      });
    }

    setChecks(newChecks);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!loading && popularServices.length > 0) {
      performChecks();
    }
  }, [loading, popularServices, serviceTypePricing, additionalServices, frequencyOptions, roomPricing]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-50 border-green-200";
      case "fail":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "pass":
        return "text-green-800";
      case "fail":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      default:
        return "text-gray-800";
    }
  };

  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading service data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              Check Services
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Validate and verify service configurations
            </p>
          </div>
          <button
            onClick={fetchAllData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Checks</div>
          <div className="text-2xl font-bold text-gray-900">{checks.length}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-600 mb-1">Passed</div>
          <div className="text-2xl font-bold text-green-700">{passCount}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="text-sm text-yellow-600 mb-1">Warnings</div>
          <div className="text-2xl font-bold text-yellow-700">{warningCount}</div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="text-sm text-red-600 mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-700">{failCount}</div>
        </div>
      </div>

      {/* Checks List */}
      <div className="space-y-4">
        {checks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-900 text-lg font-semibold mb-2">No checks performed</p>
            <p className="text-gray-600 text-sm">Click refresh to run service checks</p>
          </div>
        ) : (
          checks.map((check, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg border-2 ${getStatusColor(check.status)} p-4 md:p-6`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getStatusIcon(check.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-lg font-semibold ${getStatusTextColor(check.status)}`}>
                      {check.category}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        check.status === "pass"
                          ? "bg-green-100 text-green-700"
                          : check.status === "fail"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {check.status.toUpperCase()}
                    </span>
                  </div>
                  <p className={`text-sm md:text-base mb-3 ${getStatusTextColor(check.status)}`}>
                    {check.message}
                  </p>
                  {check.details && check.details.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {check.details.map((detail, detailIndex) => (
                        <div
                          key={detailIndex}
                          className="text-xs md:text-sm text-gray-600 flex items-start gap-2"
                        >
                          <span className="mt-1">•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a
            href="/admin/services"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Manage Services</span>
          </a>
          <a
            href="/admin/pricing"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Manage Pricing</span>
          </a>
          <a
            href="/admin/bookings"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">View Bookings</span>
          </a>
        </div>
      </div>
    </div>
  );
}
