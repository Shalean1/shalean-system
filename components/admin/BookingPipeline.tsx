import { BookingPipeline as BookingPipelineType } from "@/lib/storage/admin-supabase";

interface BookingPipelineProps {
  data: BookingPipelineType[];
}

export default function BookingPipeline({ data }: BookingPipelineProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const getStatusColor = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized.includes("pending")) return "bg-yellow-500";
    if (normalized.includes("confirmed")) return "bg-blue-500";
    if (normalized.includes("accepted")) return "bg-green-500";
    if (normalized.includes("progress")) return "bg-purple-500";
    if (normalized.includes("completed")) return "bg-green-600";
    return "bg-gray-500";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Booking Pipeline</h3>
        <p className="text-sm text-gray-600 mt-1">Status distribution of all bookings</p>
      </div>
      <div className="space-y-4">
        {data.map((item) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.status} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {item.status}
                </span>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor(item.status)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
