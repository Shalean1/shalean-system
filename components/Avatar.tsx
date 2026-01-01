interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

// Generate a consistent color based on the name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500",
  ];
  
  // Use the name to consistently pick a color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Get initials from name (first letter)
function getInitials(name: string): string {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}

export default function Avatar({ name, size = 192, className = "" }: AvatarProps) {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  
  return (
    <div
      className={`${bgColor} rounded-full flex items-center justify-center text-white font-bold shadow-lg ${className}`}
      style={{ width: size, height: size, fontSize: `${size * 0.4}px` }}
    >
      {initials}
    </div>
  );
}

