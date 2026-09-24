import { requireUser } from "@/lib/session";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { NavLinks } from "@/components/layout/NavLinks";
import { prisma } from "@/lib/db";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();
  const settings = await prisma.shopSettings.findFirst();

  return (
    <div className="min-h-screen bg-paper">
      <header className="bg-rail text-white">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-2.5">
          <div className="flex items-center gap-2.5">
            {settings?.logoPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoPath}
                alt={`${settings.businessName} logo`}
                className="h-7 w-auto rounded-sm bg-panel/90 p-0.5"
              />
            )}
            <span className="font-display text-lg uppercase tracking-[0.08em] text-white">
              {settings?.businessName ?? "Garage Service System"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">
              {session.displayName}{" "}
              <span className="text-white/40">· {session.role}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
        <div className="px-4">
          <NavLinks />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
