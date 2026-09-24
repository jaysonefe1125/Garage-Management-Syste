"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:border-white/40 hover:text-white"
    >
      Log out
    </button>
  );
}
