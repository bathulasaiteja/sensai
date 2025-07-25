import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[100vh] px-4 
    text-center"
    >
      <h1 className="text-6xl font-bold gradient-title mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-6">
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button>Go to Homepage</Button>
      </Link>
    </div>
  );
}
