# Car Garage Service System — Project Spec

## 1. Purpose
A system to run the day-to-day business of a car garage (repair + paint jobs): tracking
customers, vehicles, service work, labor, parts, retail inventory, invoicing, printable
contracts, scheduling, and reporting. Built for one location initially, but the data model
should not block adding more locations later.

## 2. Core Entities

- **Customer** — name, phone, email, address, notes.
- **Vehicle** — VIN, make, model, year, plate, color, mileage, linked to one or more customers,
  full service history.
- **Work Order** (the center of the system) — customer, vehicle, date opened/closed, status
  (intake → in progress → waiting on parts → completed → invoiced → closed), description/diagnosis,
  mileage in/out, assigned technician(s).
  - **Labor line items** — description, technician, hours, rate, total.
  - **Parts line items** — linked to an inventory item, quantity, unit cost, unit price, total.
- **Inventory Item** — SKU, name, category, supplier, cost price, sell price, quantity on hand,
  reorder threshold. Two uses of the same catalog:
  - Parts consumed on a work order.
  - Retail items sold directly (walk-in sale, no work order — e.g. oil, accessories).
  - **Stock movement log** — received / used-on-work-order / sold-direct / adjusted, with timestamp.
- **Invoice** — generated from a work order (labor + parts + tax) or from a direct retail sale.
  Payment records: method, amount, date, balance due, supports partial payments.
- **Printable Document** — see section 3, this is a first-class feature, not just a PDF export
  of an invoice.
- **Appointment** — customer, vehicle, date/time, estimated duration, assigned bay/technician.
  Converts into a Work Order when the customer arrives.
- **Employee** — name, role, hourly rate or commission %, hours logged per work order (payroll
  model still TBD — start with hours/commission tracking, not full payroll processing).
- **User Account** — login tied to a role: Owner/Admin, Front-desk/Service Writer, Technician.
- **Shop Settings** — business name, logo (uploaded image), address, phone, email, tax ID,
  and any other letterhead info. Configurable from a settings screen, not hardcoded. Used
  everywhere the shop's identity appears: app header/branding and printable documents.
  Example: business name "Unknown Auto Spa" with an uploaded logo file.

## 3. Printable Contracts (explicit requirement)
Two related but distinct documents, both generated from a Work Order and printable/PDF:

1. **Estimate / Work Authorization** — given to the client *before* work starts, to be signed.
   Contains: shop name/logo (pulled from Shop Settings), client info, vehicle info, description
   of work (e.g. "repaint front bumper, repair dent on rear quarter panel"), itemized estimated
   costs (labor + parts), total, terms/disclaimers, signature lines (client + shop rep), date.
2. **Final Invoice / Receipt** — given to the client *after* work is complete, as their copy.
   Same layout, actual costs, marked paid/balance due.

Implementation note: build one templating system that can render either document type from the
same work-order data, so adding a third template later (e.g. pickup/drop-off checklist) is cheap.

## 4. Feature List by Module

| Module | MVP | Later |
|---|---|---|
| Customers & Vehicles | CRUD, service history view | Reminders for recurring maintenance |
| Work Orders | full lifecycle, labor + parts line items | Photos, digital signature capture |
| Inventory | items, stock levels, cost/sell price, low-stock flag | Supplier reorder automation |
| Invoicing & Payments | generate from work order, track payment status | Payment processor integration, configurable tax rates |
| Printable Contracts | Estimate + Invoice templates, PDF export | Custom branding per template |
| Scheduling | calendar, appointment → work order conversion | Bay/technician capacity view |
| Reporting | revenue by period, outstanding balances, inventory valuation | Profit margin by labor vs parts, technician productivity |
| Employees | hours logged per work order | Commission calculation, payroll export |
| Roles & Auth | Admin / Front-desk / Technician roles | Per-location permission scoping if multi-site |

## 5. Non-Functional Requirements
- Must stay usable if internet is unreliable at the shop (favor a local-first setup over a
  pure cloud SaaS dependency).
- Easy to back up (plain file-based DB export, e.g. copy a SQLite file, or scheduled export to CSV/PDF).
- UI simple enough for non-technical front-desk staff.
- Printable output must look professional (this is a customer-facing document).

## 6. Recommended Tech Stack
Given: single location for now, occasional unreliable internet, need for printable PDF
contracts, small team.

- **App shape:** local-first web app — a small server + SQLite database running on a machine
  in the shop, accessed via browser on the local network. Avoids full offline-sync complexity
  while not depending on internet for daily operation. Can move to Postgres + cloud hosting
  later if a second location gets added.
- **Backend:** Node.js (Express) or Python (FastAPI) — either is fine; pick based on your
  familiarity.
- **Frontend:** React (or plain server-rendered pages if you want to minimize moving parts).
- **PDF generation:** render the contract/invoice as HTML and convert to PDF (e.g. Puppeteer,
  or a Python HTML-to-PDF lib) so the same template drives both the on-screen view and the
  printable copy.
- **Auth:** simple username/password with roles; no need for third-party auth for a single-shop
  internal tool.

## 7. Suggested Build Order (MVP first)
1. Customers, Vehicles, Work Orders (labor + parts line items), basic Inventory.
2. Printable Estimate + Invoice templates (PDF export).
3. Payment tracking on invoices.
4. Scheduling/calendar + appointment-to-work-order conversion.
5. Reporting dashboards.
6. Multi-user roles/auth.
7. Employee hours/commission tracking (payroll export later).

## 8. Decisions
- **Tax handling:** not needed for now — no tax calculation in MVP. Can be added later as a
  configurable rate in Shop Settings if needed.
- **Supplier-level tracking:** maybe — not in MVP. Keep the Inventory Item data model easy to
  extend with a `supplier` field/table later rather than designing it in now.
- **Auth:** keep it simple — basic username/password login with roles (Admin / Front-desk /
  Technician), no third-party auth, no per-location permission complexity.
- **Paper form matching:** not needed — free to design the Estimate/Invoice layout from
  scratch rather than replicating an existing paper form.
