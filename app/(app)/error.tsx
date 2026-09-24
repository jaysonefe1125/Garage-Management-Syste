"use client";

import { useRouter } from "next/navigation";
import { secondaryButtonClass } from "@/components/ui/styles";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="max-w-md rounded-lg border border-danger/30 bg-danger-bg p-6 text-center">
        <h1 className="font-display text-lg uppercase tracking-wide text-danger">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-danger">{error.message}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={() => reset()} className={secondaryButtonClass}>
            Try Again
          </button>
          <button onClick={() => router.back()} className={secondaryButtonClass}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
