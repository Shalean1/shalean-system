import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCleaner } from "@/lib/storage/cleaner-auth-supabase";
import { FileText, CheckCircle, AlertCircle, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CleanerContractPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/cleaner/login");
  }

  // Check if user is a cleaner
  const cleaner = await getCurrentCleaner();
  
  if (!cleaner) {
    // Not a cleaner account, redirect to regular login
    redirect("/auth/login");
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              My Contract
            </h1>
          </div>
          <p className="text-base md:text-lg text-gray-600">
            Terms and conditions for cleaners working with Bokkie
          </p>
        </div>

        {/* Contract Information */}
        <div className="space-y-6">
          {/* Contract Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Contract Status</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">Status</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Cleaner ID</span>
                <span className="text-gray-900 font-mono">{cleaner.cleanerId}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Name</span>
                <span className="text-gray-900">{cleaner.name}</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Terms and Conditions
            </h2>
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Service Agreement</h3>
                <p className="text-gray-700 leading-relaxed">
                  By working with Bokkie, you agree to provide professional cleaning services 
                  in accordance with the standards and guidelines set forth by the company. 
                  You are expected to maintain a high level of professionalism and quality in 
                  all cleaning assignments.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Work Standards</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Arrive on time for all scheduled appointments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Complete all assigned cleaning tasks thoroughly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Use provided cleaning supplies and equipment properly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Maintain a professional appearance and demeanor</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Respect client property and privacy</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Payment Terms</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                  <p className="text-sm text-blue-800">
                    <strong>Payment Schedule:</strong> Payments are processed weekly for completed jobs. 
                    Earnings are calculated based on completed bookings and tips received.
                  </p>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Payments are made for completed jobs only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Tips are paid in full to the cleaner</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Payment disputes must be reported within 7 days</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Availability and Scheduling</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You are responsible for maintaining accurate availability in your profile. 
                  This includes:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Updating your work days regularly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Notifying the system of any unavailability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Accepting or declining booking requests promptly</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Code of Conduct</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium mb-1">Important Guidelines</p>
                      <p className="text-sm text-yellow-700">
                        Any violation of these guidelines may result in termination of your contract.
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Treat all clients with respect and professionalism</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Maintain confidentiality of client information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Report any issues or concerns immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Do not engage in any illegal activities</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Equipment and Supplies</h3>
                <p className="text-gray-700 leading-relaxed">
                  Bokkie provides necessary cleaning supplies and equipment for all jobs. 
                  You are responsible for using these items properly and reporting any 
                  shortages or issues. Personal protective equipment (PPE) will be provided 
                  as required by health and safety regulations.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Performance and Reviews</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Your performance will be monitored through client feedback and ratings. 
                  Maintaining high ratings is important for:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Continued assignment to jobs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Eligibility for premium assignments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Performance bonuses and incentives</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  Either party may terminate this agreement with appropriate notice. 
                  Bokkie reserves the right to terminate immediately in cases of 
                  misconduct, violation of terms, or failure to meet performance standards.
                </p>
              </section>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-blue-800 text-sm leading-relaxed mb-3">
                  If you have any questions about your contract or need clarification on any terms, 
                  please contact Bokkie support through your dashboard or reach out directly.
                </p>
                <p className="text-blue-800 text-sm">
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-ZA', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Pages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a
                href="/cleaner/info"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
              >
                <div className="font-medium">My Info</div>
                <div className="text-sm text-gray-500">View your account information</div>
              </a>
              <a
                href="/cleaner/earnings"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
              >
                <div className="font-medium">My Earnings</div>
                <div className="text-sm text-gray-500">View payment history</div>
              </a>
              <a
                href="/cleaner/work-days"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
              >
                <div className="font-medium">My Work Days</div>
                <div className="text-sm text-gray-500">Update availability</div>
              </a>
              <a
                href="/cleaner/performance"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
              >
                <div className="font-medium">My Performance</div>
                <div className="text-sm text-gray-500">View ratings and reviews</div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
