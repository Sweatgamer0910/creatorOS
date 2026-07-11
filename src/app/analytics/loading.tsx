import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: "60vh" }}
    >
      <Spinner size={40} />
    </div>
  );
}
