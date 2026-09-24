import { prisma } from "@/lib/db";
import { updateShopSettings } from "@/lib/actions/shopSettings";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
  pageTitleClass,
} from "@/components/ui/styles";

export default async function SettingsPage() {
  const settings = await prisma.shopSettings.findFirst();

  return (
    <div className="max-w-2xl">
      <h1 className={pageTitleClass}>Shop Settings</h1>
      <p className="mt-1 text-sm text-muted">
        This information appears on printed estimates and invoices.
      </p>

      <form
        action={updateShopSettings}
        encType="multipart/form-data"
        className="mt-6 space-y-4 rounded-lg border border-line bg-panel p-6"
      >
        <div>
          <label className={labelClass}>Business Name</label>
          <input
            name="businessName"
            defaultValue={settings?.businessName ?? ""}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Logo</label>
          {settings?.logoPath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoPath}
              alt="Current logo"
              className="mb-2 h-16 w-auto rounded border border-line bg-ink/[0.03] p-1"
            />
          )}
          <input type="file" name="logo" accept="image/*" className="text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Address Line 1</label>
            <input
              name="addressLine1"
              defaultValue={settings?.addressLine1 ?? ""}
              className={inputClass}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Address Line 2</label>
            <input
              name="addressLine2"
              defaultValue={settings?.addressLine2 ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input
              name="city"
              defaultValue={settings?.city ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              name="state"
              defaultValue={settings?.state ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Zip</label>
            <input
              name="zip"
              defaultValue={settings?.zip ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              name="phone"
              defaultValue={settings?.phone ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              name="email"
              type="email"
              defaultValue={settings?.email ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Tax ID</label>
            <input
              name="taxId"
              defaultValue={settings?.taxId ?? ""}
              className={inputClass}
            />
          </div>
        </div>

        <button type="submit" className={primaryButtonClass}>
          Save Settings
        </button>
      </form>
    </div>
  );
}
