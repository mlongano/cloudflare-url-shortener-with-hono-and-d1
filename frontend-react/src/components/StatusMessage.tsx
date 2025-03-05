import { StatusMessageProps } from "@/types";

export default function StatusMessage({
  message,
  type,
  visible,
}: StatusMessageProps) {
  if (!visible) return null;

  const baseClasses = "mt-4 py-3 px-3 rounded-md text-center";
  const typeClasses =
    type === "success"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
}
