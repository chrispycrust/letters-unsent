import Spinner from "@/components/Spinner";

interface RouteLoadingProps {
  message: string;
}

export default function RouteLoading({ message }: RouteLoadingProps) {
  return (
    <div
      className="route-loading spinner-container"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <Spinner />
      <span className="sr-only">{message}</span>
    </div>
  );
}
