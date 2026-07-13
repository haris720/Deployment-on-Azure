import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/common/UI";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <UtensilsCrossed className="text-brand" size={40} />

      <p className="mt-6 text-5xl font-bold">404</p>

      <h1 className="mt-2 text-xl font-semibold">Page not found</h1>

      <p className="mt-2 text-sm text-muted">
        The page you're looking for doesn't exist or has moved.
      </p>

      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button>Back home</Button>
        </Link>

        <Link to="/restaurants">
          <Button variant="outline">Browse restaurants</Button>
        </Link>
      </div>
    </div>
  );
}
