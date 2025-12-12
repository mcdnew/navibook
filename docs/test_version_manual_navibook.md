# NaviBook Test Version – User Manual


Use this manual as your guide while exploring NaviBook.

- Target users: office staff, agents, managers, admins, captains, and testers.
- Environment: NaviBook test/demo instance (local or deployed).
- Scope: UI flows only (no developer setup or code changes).

---

## 1. Accessing the Test Environment

1. Make sure the app is running.
2. Open the base URL in a browser.
3. You should see the **NaviBook landing page**:
   - System name and company name.
   - Fleet status cards (if boats are in the database).
   - A status strip showing database and realtime connectivity.
   - A **Login** and a **Register** button at the bottom.
4. Use the **demo credentials** below for most testing. Registration is supported but not required for basic flows.

---

## 2. Demo Accounts (Test Logins)

Use these for realistic role‑based testing. All passwords are visible in `day-charter/DEMO_CREDENTIALS.md`.

| Persona | Role          | Email                       | Password    | Notes                                |
|--------|---------------|-----------------------------|-------------|--------------------------------------|
| Admin  | Admin         | `admin@navibook.com`        | `Admin123!` | Full access, ideal for full testing. |
| Maria  | Office Manager| `maria@sunsetcharters.com`  | `Demo2025!` | Front desk, no commission.           |
| Carlos | Power Agent   | `carlos@sunsetcharters.com` | `Demo2025!` | High‑volume sales agent.             |
| Sofia  | Regular Agent | `sofia@sunsetcharters.com`  | `Demo2025!` | Typical agent workflow.              |
| Pablo  | Regular Agent | `pablo@sunsetcharters.com`  | `Demo2025!` | Motor yacht focus.                   |
| Elena  | Regular Agent | `elena@sunsetcharters.com`  | `Demo2025!` | New agent (lower commission).        |
| Juan   | Captain/Owner | `juan@sunsetcharters.com`   | `Demo2025!` | Owner captain, €0/h.                 |
| Marco  | Captain       | `marco@sunsetcharters.com`  | `Demo2025!` | Senior captain, €35/h.               |
| Luis   | Captain       | `luis@sunsetcharters.com`   | `Demo2025!` | Junior captain, €25/h.               |

For **full coverage**, test mainly with:

- **Admin** – can access most pages (fleet, pricing, reports, etc.).
- **Maria (Office Manager)** – realistic front‑desk workflow.
- **Carlos (Power Agent)** – heavy use of mobile quick booking.
- **Sofia or Elena (Regular Agent)** – typical agent plus commission.
- **Juan/Marco/Luis (Captains)** – captain‑specific dashboard behaviour.

---

## 3. Roles and Permissions Overview

The system uses a `user_role` enum. In the seeded demo data you will see these roles:

- `admin` – full company‑level control.
- `manager` – high‑level operations and pricing control.
- `office_staff` – day‑to‑day operations, reporting and payments.
- `accountant` – payments and financial views.
- `power_agent` – senior agent with extra tools like advanced booking.
- `regular_agent` – standard sales agent.
- `captain` – sees assigned charters and captain‑oriented info.

From the UI and code:

- **Everyone logged‑in** can:
  - See the **Dashboard**, **Calendar**, **Bookings**, **Customers (Guests)** and basic **Weather** view.
  - Use the mobile bottom navigation (on small screens).
- **Admin / Manager**:
  - Access **Pricing**, **Advanced Booking**, **Blocked Slots**, **Reports**, **Payments**.
- **Power Agent**:
  - Access **Advanced Booking** and **Blocked Slots**.
- **Office Staff**:
  - Access **Reports**, **Payments** and dashboard cleanup tools.
- **Accountant**:
  - Access **Payments**.
- **Captains**:
  - See captain‑specific widgets on the **Dashboard** and a placeholder **My Bookings** mobile page.

If a role tries to access a restricted page, they will usually be redirected back to `/dashboard`.

---

## 4. Global UI Basics

### 4.1 Navigation

- **Desktop**
  - Most pages include a **Back to Dashboard** button.
  - Cross‑links (e.g. from Dashboard to Calendar, Bookings, etc.) are via cards and buttons.
- **Mobile (small screens)**
  - A fixed **bottom navigation bar** appears on most pages (not on the root landing page or customer portal):
    - `Home` → `/dashboard`
    - `Calendar` → `/calendar`
    - `Bookings` → `/bookings`
    - `Guests` → `/customers`
    - `Payments` → `/payments`

### 4.2 Theme & Layout

- A **Theme Toggle** appears in the top‑right of many pages.
- The app uses responsive Tailwind layouts; on mobile, key information is stacked.

### 4.3 Statuses & Badges

- **Booking statuses** (shown as colored chips/badges):
  - `pending_hold` – booking is on a temporary hold.
  - `confirmed` – booking is confirmed.
  - `completed` – charter completed.
  - `cancelled` – cancelled.
  - `no_show` – customer did not show.
- **Payment status** (portal and reports):
  - `paid`, `partial`, `unpaid`.

You can test state transitions via booking actions (confirm, complete, cancel, mark no‑show, etc.) depending on role.

### 4.4 Dates, Times, Currency

- Dates are typically shown as **YYYY‑MM‑DD** in forms; friendly formats in overviews.
- Times use 24‑hour format (e.g. `10:00`).
- Currency is **Euro (€)**.

---

## 5. Authentication Flows

### 5.1 Logging In

1. From the landing page, click **Login** (or go directly to `/login`).
2. Enter an email and password from the **demo list** above.
3. Click **Login**.
4. On success, you should be redirected to `/dashboard`.
5. On failure, you should see an inline error message and remain on the login page.

**Test suggestions**

- Valid login (e.g. `admin@navibook.com` / `Admin123!`).
- Invalid email or password.
- Logout and login again (see Dashboard section for logout).

### 5.2 Registration (Optional) 

1. From the landing page, click **Register** (or go to `/register`).
2. Fill in company and user details as requested.
3. Submit the form.
4. Confirm that:
   - A new company and user are created.
   - You can log in with the new account.

> For manual testing of core functionality, you can skip registration and rely on demo accounts.

---

## 6. Dashboard (`/dashboard`)

The dashboard is the main hub after login.

### 6.1 Header

- Shows **“Dashboard”** and a welcome line with your first name.
- Top‑right controls:
  - **Theme toggle**.
  - (For some roles) a **Manual Cleanup** button that cleans expired booking holds.
  - **Logout** button:
    - Submits a form that ends the session and returns you to the login page.

### 6.2 Your Account Card

Shows:

- Name and email.
- Role (e.g. `power agent`, `office staff`).
- Company name.
- Commission rate (for agent roles).
- Active/inactive status badge.

**Test**: Log in with different roles to confirm the card updates accordingly.

### 6.3 Captain‑Specific Section

If you log in as a **captain** (e.g. Juan, Marco, Luis), you will see:

- **“Your Upcoming Charters”** card.
- A list of upcoming bookings assigned to that captain:
  - Date & time.
  - Boat name and type.
  - Number of passengers.
  - Agent who created the booking.
  - A `TODAY` badge for charters scheduled for the current date.

**Test**

- Log in as `juan@sunsetcharters.com` and verify:
  - Upcoming charters appear.
  - Today’s charters are highlighted.

### 6.4 Fleet / Booking Summary Area

The lower part of the dashboard uses additional cards and tabs (see `dashboard-bookings-tabs.tsx`) to show:

- Upcoming bookings.
- Quick navigation links to **Calendar**, **Bookings**, **Quick Book** etc.

Use these links to move quickly between pages during testing.

---

## 7. Quick Booking (`/quick-book`) – Agent Workflow

This is the **primary booking creation flow**, optimized for agents on mobile.

### 7.1 Access

- From **Bookings** page via **“New Booking”** button.
- Directly at `/quick-book`.

### 7.2 Form Sections

The page is one long card‑based form:

1. **Booking Basics**
   - Date (calendar picker).
   - Start time (dropdown / time input).
   - Duration (`2h`, `3h`, `4h`, `8h`).
   - Number of passengers.
2. **Package & Boat**
   - Package type:
     - `Charter Only`
     - `Charter + Drinks`
     - `Charter + Food`
     - `Full Package`
   - Available boats :
     - Filtered by company, date, time and overlapping bookings.
     - Capacity and boat type shown for each.
3. **Customer Details**
   - Name (required).
   - Phone (required).
   - Email (optional, but recommended for portal links).
   - Notes / special requests.
4. **Captain & Pricing**
   - Captain selection (optional):
     - Captain list is filtered by company and role `captain`.
     - Captain hourly rate is stored and used to calculate captain fee.
   - Auto‑calculated totals:
     - Base price from `pricing` table (depends on boat, duration, package).
     - Commission based on agent commission percentage.
     - Captain fee (if captain selected).
   - Deposit amount (optional numeric field).
5. **Confirmation Options**
   - “Confirm Immediately” toggle:
     - Off → booking is created as a **hold** with an expiry timer.
     - On → booking is **confirmed** immediately.

### 7.3 Availability & Holds

- When date/time/duration changes, the page automatically **checks availability**:
  - Calls `get_available_boats` with selected parameters.
  - Shows an error message if availability check fails.
  - Clears the selected boat if it becomes unavailable.
- After submission, if you do **not** confirm immediately:
  - A **hold timer** is started (you’ll see a countdown).
  - You must confirm the booking before the hold expires.
  - A background cleanup job removes expired holds.

### 7.4 Creating a Booking – Test Steps

1. Log in as **Carlos (Power Agent)**.
2. Go to `/quick-book`.
3. Set:
   - Date: tomorrow.
   - Start time: `10:00`.
   - Duration: `4h`.
   - Passengers: `6`.
   - Package: `Full Package`.
4. Wait for **Available Boats** to load; pick a boat.
5. Optionally choose a captain (e.g. Marco) and verify captain fee is included.
6. Fill in customer name, phone, and email.
7. Set a deposit amount (e.g. `200`).
8. Leave “Confirm Immediately”:
   - **On** to create a confirmed booking.
   - **Off** to create a hold (then watch the hold timer).
9. Submit the form.
10. Verify you see a success message and/or confirmation dialog.
11. Open **Bookings** (`/bookings`) to confirm the new booking is listed with the correct status and amounts.

Repeat with different roles and parameters (e.g. different durations, packages, boats).

---

## 8. Bookings List & Details (`/bookings` and `/bookings/[id]`)

### 8.1 Bookings List (`/bookings`)

Access:

- From mobile bottom nav → **Bookings**.
- Directly at `/bookings`.

Behaviour:

- **Admin, Manager, Office Staff**:
  - See **all** bookings for the company.
- **Agents (regular/power)**:
  - See only **their own** bookings.
- The page shows:
  - A header with **“Bookings”** and an **Anchor** icon.
  - A **New Booking** button linking to `/quick-book`.
  - Theme toggle and a Back to Dashboard button.
  - Either:
    - A table/list of bookings with filters (boats, date, status), or
    - An empty state card with a “Create First Booking” button.

**Test**

- Log in as **Admin** and verify you see many bookings.
- Log in as **Carlos** and verify you see a subset where `agent` is Carlos.

### 8.2 Booking Detail (`/bookings/[id]`)

Open a booking by clicking it in the list.

The detail view shows:

- Header:
  - Back to **Bookings**.
  - Booking ID.
  - A large status badge (Pending Hold, Confirmed, Completed, etc.).
- **Action buttons** (via `BookingActions`):
  - Confirm booking.
  - Mark as completed.
  - Cancel booking.
  - Mark as no‑show.
  - Edit booking details (opens a dialog).
  - Possibly add payments / open invoice (depending on implementation and role).
- **Sections** (cards):
  - Customer information (name, email, phone).
  - Charter details (date, time, duration, boat, package, passengers).
  - Agent and captain assignment.
  - Financial summary (total price, commission, captain fee).
  - Payment transactions (if any).
  - Booking history timeline:
    - Each change recorded with timestamp, actor, and old/new data.

Role behaviour:

- Agents cannot open bookings that don’t belong to them (they are redirected).
- Admin/manager/office staff see all bookings.

**Test scenarios**

1. **Confirming a hold**
   - Create a booking as a hold via Quick Book.
   - Open the booking detail as Admin or Office Staff.
   - Use the **Confirm** action.
   - Verify status changes to `CONFIRMED` and history is updated.
2. **Completing a charter**
   - Locate a confirmed booking in the past.
   - Use **Complete** action.
   - Verify status and history.
3. **Cancelling / No‑Show**
   - Use **Cancel** or **Mark No‑Show** and verify status.

---

## 9. Calendar (`/calendar`)

The calendar provides a visual overview of bookings and supports drag‑and‑drop rescheduling.

### 9.1 Access & Permissions

- Any logged‑in user can open `/calendar`.
- Agents will see **only their own** bookings; other roles see all bookings.

### 9.2 Layout

- Header:
  - Title **“Calendar”**.
  - Description: interactive booking calendar with drag‑and‑drop.
  - Theme toggle and a **Back to Dashboard** button.
- Calendar component:
  - Month/Week/Day views (via `react-big-calendar`).
  - Events colored either:
    - By boat, or
    - By booking status.
  - Filter controls:
    - Boat filter.
    - Status filter.
    - Color‑by selector.

### 9.3 Interactions

- Click an event to open a dialog:
  - Basic booking details and actions.
  - Link to **View Booking** detail page.
- Drag & drop an event:
  - Move it to a different time slot or day.
  - You should see a confirmation dialog or toast message.
  - The booking’s date/time should update (subject to conflicts and permissions).

**Test**

1. Reschedule a booking by dragging it.
2. Check the booking’s detail page to ensure times changed.
3. Try filters:
   - Filter by boat.
   - Filter by status (confirmed, pending, etc.).

---

## 10. Waitlist (`/waitlist`)

The Waitlist page manages customers who want a charter when there is no current availability.

### 10.1 Access

- Any authenticated user can load `/waitlist` (with company scoping).

### 10.2 Layout & Behaviour

- Header: **“Waitlist”** with a clock icon and description.
- Theme toggle and Back to Dashboard.
- Main table/list:
  - Waitlist entries with:
    - Customer name and contact.
    - Desired date/time.
    - Preferred boat or boat type.
    - Notes.
  - Actions to:
    - Edit waitlist entry.
    - Convert to booking (opens a conversion dialog).
- When converting to a booking:
  - You select a boat, date, time and package.
  - The system creates a booking (similar to Quick Book) and removes or updates the waitlist entry.

**Test**

1. Add a waitlist entry (from Waitlist page or a booking flow if exposed).
2. Verify it appears in the list.
3. Use **Convert** to turn it into a booking.
4. Confirm the booking appears in `/bookings` and the waitlist is updated.

---

## 11. Advanced Booking (`/advanced-booking`)

Advanced Booking is for recurring bookings, templates, and cancellation policies.

### 11.1 Access

- Only `admin`, `manager`, and `power_agent` can access this page; others are redirected to `/dashboard`.

### 11.2 Features

From the page and `AdvancedBookingClient`:

- **Recurring booking templates**
  - Set patterns like “every Saturday 10:00–14:00 for Boat X”.
  - Quickly generate multiple future bookings based on templates.
- **Waitlist integration**
  - See recent waitlist entries.
  - Convert them to bookings with more control than the basic Waitlist page.
- **Cancellation policies**
  - Manage company‑level cancellation policies (e.g. free cancellation until X days before, partial refund windows).
  - Select default policies and apply them to bookings.

**Test**

1. Log in as **Admin**.
2. Open `/advanced-booking`.
3. Create or adjust a cancellation policy.
4. Use a template or waitlist entry to generate bookings.
5. Validate that created bookings look correct in `/bookings` and `/calendar`.

---

## 12. Fleet Management (`/fleet`)

The Fleet page manages the boats and vessels.

### 12.1 Access

- Any authenticated user can reach `/fleet`, but in real operations this feature is usually used by Admin/Manager.

### 12.2 Features

- List of boats:
  - Name, type (sailboat/motorboat/jetski), capacity, active status.
- Actions (via `FleetManagementClient`):
  - Add a new boat.
  - Edit boat details.
  - Activate/deactivate boats instead of deleting where possible.

**Test**

1. As Admin, add a new boat (unique name).
2. Verify it appears:
   - On the landing page fleet status.
   - In Quick Book’s available boats (after applying relevant date/time).
3. Deactivate a boat and confirm it disappears from availability lists while remaining in historical bookings.

---

## 13. Customers / Guests (`/customers`)

The Customers page aggregates bookings by customer to give a CRM‑style view.

### 13.1 Access & Behaviour

- Any authenticated user can open `/customers`.
- Data is scoped to the logged‑in user’s company.
- Customers are grouped primarily by **email**, falling back to phone number.

### 13.2 Content

- For each customer:
  - Name.
  - Email and phone.
  - Total spent (sum of confirmed/completed bookings).
  - Last booking date.
  - List of bookings including:
    - Date and time.
    - Status.
    - Boat name.
    - Package type.
- Sorting:
  - Customers are sorted by **total spent**, highest first.

**Test**

1. Create multiple bookings with the same customer email.
2. Open `/customers` and verify:
   - Those bookings are grouped under one customer.
   - Total spent matches expectations.

---

## 14. Blocked Slots (`/blocked-slots`)

Blocked Slots are used for maintenance, private use, or other reasons a boat cannot be booked.

### 14.1 Access

- Only `admin`, `manager`, and `power_agent` can use this page.

### 14.2 Features

- Header: **“Blocked Slots”** with a ban icon.
- Boat selector filtered by company and active status.
- Main UI (via `BlockedSlotsClient`):
  - Add a block:
    - Select boat.
    - Choose date and time range.
    - Enter a reason (maintenance, private charter, etc.).
  - View existing blocks.
  - Remove or edit blocks.

Blocked slots are considered when checking boat availability (e.g. Quick Book and Calendar).

**Test**

1. Create a blocked slot for a boat on a specific day/time.
2. Go to `/quick-book` and attempt to book that boat in the blocked period.
3. Confirm it is not offered as available.
4. Remove the block and confirm the boat becomes available.

---

## 15. Pricing Management (`/pricing`)

The Pricing page configures rates for each boat, duration, and package.

### 15.1 Access

- Only `admin` and `manager` can access `/pricing`.

### 15.2 Features

- Header: **“Pricing Management”**.
- Table/grid of pricing entries:
  - Boat name and type.
  - Duration (`2h`, `3h`, `4h`, `8h`).
  - Package (`charter_only`, `charter_drinks`, `charter_food`, `charter_full`).
  - Price (€).
- Actions (via `PricingClient`):
  - Create a new pricing entry.
  - Edit existing prices.
  - Copy pricing between boats or durations for faster setup.

Pricing values are consumed by:

- Quick Book total calculation.
- Reports and financial views.

**Test**

1. Adjust the price for a specific boat/package/duration.
2. Create a new booking using that combination.
3. Confirm the booking’s total matches the pricing configuration.

---

## 16. Payments (`/payments`)

The Payments page is a finance‑oriented view of bookings and payment transactions.

### 16.1 Access

- Roles allowed: `admin`, `manager`, `office_staff`, `accountant`.

### 16.2 Data Model

- Payments are stored in `payment_transactions` with:
  - `payment_type`:
    - `deposit`, `final_payment`, `full_payment`, `refund`, `partial_refund`.
  - `payment_method`:
    - `cash`, `card`, `bank_transfer`, `paypal`, `stripe`, `other`.
  - Constraints enforce positive amounts for payments and negative for refunds.
- A view `booking_payment_status` summarises:
  - Total price.
  - Total paid.
  - Outstanding balance.
  - Payment status: `paid` / `partial` / `unpaid`.

### 16.3 Page Behaviour

- For each booking row you can:
  - See payment status (badge).
  - Inspect all recorded payments.
  - Add new payments or refunds via dialogs (labelled by payment type and method).

**Test**

1. Pick an unpaid booking.
2. Add a **deposit** payment.
3. Confirm:
   - Payment history shows the entry.
   - Outstanding balance decreases.
   - Payment status becomes `partial`.
4. Add a **final payment** so that total paid equals total price.
5. Confirm payment status becomes `paid`.
6. Add a **refund** and confirm the status remains consistent with total amounts.

---

## 17. Reports & Analytics (`/reports`)

The Reports page provides business‑level insight.

### 17.1 Access

- Roles allowed: `admin`, `manager`, `office_staff`.

### 17.2 Main Metrics

From `CONTROL_TOWER_REPORTS.md` and the implementation, the page shows:

- Date range selector and export buttons (CSV).
- Summary tiles:
  - Revenue.
  - Average booking value.
  - Number of bookings.
  - Agent commission totals.
  - Captain costs.
  - Total costs.
  - Net profit.
  - Profit margin (%).
- Visualizations:
  - Revenue vs costs & profit (bar chart over time).
  - Revenue breakdown (pie).
  - Booking status distribution (pie).
  - Package performance (table).
  - Top boats by revenue.
  - Agent performance with commission details.
  - Boat occupancy rates.

### 17.3 Testing the Reports

1. Log in as **Admin**.
2. Open `/reports`.
3. Select a broad date range (e.g. the full current year).
4. Confirm:
   - Metric tiles show non‑zero values.
   - Charts render correctly.
   - Tables display bookings broken down by boat, package, and agent.
5. Use the **CSV export** (if visible) and verify the file content matches on‑screen data.

---

## 18. Notifications (`/notifications`)

The Notifications page shows notification history.

### 18.1 Access & Behaviour

- Any logged‑in user can open `/notifications`.
- The page fetches up to 50 notifications for the user’s company.
- Each entry shows:
  - Type (e.g. email / SMS).
  - Subject or title.
  - Target (email/phone).
  - Timestamp.
  - Status (sent, failed, etc.).

Some notification **preferences** are also managed via dedicated UI (depending on implementation) alongside the API endpoints under `/api/notifications`.

**Test**

1. Perform an action that should generate a notification (e.g. booking confirmation).
2. Open `/notifications`.
3. Confirm a new record appears with reasonable content.

---

## 19. Weather (`/weather`)

The Weather page integrates marine forecasts via the Open‑Meteo API.

### 19.1 Access

- Any authenticated user can open `/weather`.

### 19.2 Behaviour

- Header: **“Weather Forecast”**.
- `WeatherClient` loads forecast data for a relevant location (configured in the backend).
- The page focuses on:
  - Marine safety conditions.
  - Wind, wave, or general suitability scores (exact details may vary).

**Test**

1. Open `/weather`.
2. Verify that:
   - Data loads without error.
   - Weather information is understandable (e.g. for upcoming days).
3. Optionally compare with the **customer portal** weather tab for a specific booking.

---

## 20. Captain View – My Bookings (`/my-bookings`)

The captain view is currently a **placeholder** page.

### 20.1 Access

- Open `/my-bookings` while logged in as a captain (e.g. Juan).

### 20.2 Behaviour

- Shows:
  - Header: **“My Bookings”**.
  - A note identifying the captain (e.g. “Captain Juan”).
  - A placeholder stating “Coming soon!”.
  - A button to go back to **Dashboard**.
- Includes a **Logout** button.

**Test**

- Confirm you see the placeholder content and can navigate back to the Dashboard or log out.

---

## 21. Customer Portal (`/portal/[token]`)

The customer portal lets guests view booking details, payment status, weather, and submit change requests.

### 21.1 Access

- Portal URLs look like: `/portal/<token>`.
- Tokens are generated per booking via backend logic and (in the UI) are usually exposed as a **“Copy customer link”** or similar action on the booking detail page.
- Customers are not authenticated users; the token is the access mechanism.

### 21.2 Loading the Portal

1. From a booking detail page (as Admin/Agent), find the **Customer Portal** link/button if present, or use a known test URL.
2. Open the URL in a regular browser window (you may stay logged out of the main app to simulate a customer).

Possible outcomes:

- **Valid token** → portal opens.
- **Invalid/expired token** → **Access Error** card with a message telling the user to contact the company.

### 21.3 Layout and Tabs

- Portal header:
  - Title: **“Your Booking”**.
  - Greeting with customer name.
  - Shortened booking ID.
- Tabs:
  - **Overview** – booking and payment summary.
  - **Payments** – detailed payment history.
  - **Weather** – forecast for the charter day (if available).
  - **Requests** – change request history and submission form.

### 21.4 Overview Tab

Shows:

- Boat details:
  - Name, type, capacity, number of guests.
- Date and time:
  - Booking date.
  - Start and end time.
- Package name (if defined).
- Duration in hours.
- Special requests.
- Payment summary:
  - Total price.
  - Total paid.
  - Amount due.
  - Payment status badge (Fully Paid / Partially Paid / Unpaid).
- Company contact information.

### 21.5 Payments Tab

- List of payment transactions:
  - Payment type (deposit, final payment, refund, etc.).
  - Date.
  - Payment method.
  - Notes.
  - Amount (green for payments, red for refunds).
- Empty‑state message if no payments exist.

### 21.6 Weather Tab

- Weather forecast for the booking date.
- An alert reminding customers to verify current conditions.
- Text indicating that data is powered by Open‑Meteo.

### 21.7 Change Requests Tab

- Shows previous change requests, each with:
  - Type (date change, time change, package change, participant count, etc.).
  - Current vs requested values.
  - Status badge (pending, approved, rejected, completed).
  - Notes/responses.
- A **“Request a Change”** button opens a dialog:
  - Request type selector.
  - Field for new value.
  - Optional message.
  - Submit and cancel buttons.
- On submit:
  - A POST request is sent to `/api/portal/change-request`.
  - A success toast appears if accepted; errors produce an error toast.
  - The list of change requests refreshes.

**Test**

1. Open an existing portal link for a booking.
2. Submit a **date change** request.
3. Confirm:
   - Request appears in the list with `pending` status.
   - A staff user can later see and process that request (implementation may be via an internal page or manual checks).

---

## 22. Suggested End‑to‑End Test Scenarios

Use these scenarios to validate the app like a real user.

### Scenario A – Agent Quick Booking & Confirmation

1. Log in as **Carlos (Power Agent)**.
2. Create a 4‑hour booking for tomorrow at 10:00 using **Quick Book**.
3. Choose a motorboat and the **Full Package**.
4. Assign a captain and set a deposit.
5. Save as a **hold** (do not confirm immediately).
6. Confirm the booking from the **Bookings** detail view.
7. Verify the booking:
   - Appears on the **Calendar**.
   - Appears correctly under the customer in **Customers**.
   - Shows correct payment status.

### Scenario B – Waitlist → Advanced Booking

1. Log in as **Admin**.
2. Add a waitlist entry for a fully booked day.
3. Convert that entry to a booking via **Advanced Booking**.
4. Verify:
   - The waitlist entry is updated or removed.
   - The new booking appears in **Bookings** and **Calendar**.

### Scenario C – Payments & Reports

1. Log in as **Maria (Office Manager)**.
2. Pick a booking with an outstanding balance.
3. Record a **deposit** on the **Payments** page.
4. Later, record a **final payment**.
5. Verify in:
   - Booking detail → payment section.
   - **Payments** list.
   - **Reports** metrics (revenue, payment status).

### Scenario D – Customer Portal & Change Request

1. As Admin, open a booking detail and copy the **customer portal link** (if exposed).
2. Open that link in a new browser or incognito window.
3. Verify the **Overview**, **Payments**, and **Weather** tabs.
4. Submit a change request (e.g. time change).
5. Confirm it appears as `pending` in the **Requests** tab and is visible internally.

### Scenario E – Maintenance Block & Availability Check

1. As Admin, go to **Blocked Slots** and block a boat for a specific period.
2. Try to create a booking in that slot via **Quick Book**.
3. Confirm the boat is not returned as available.
4. Remove the block and confirm the boat becomes available again.

---

## 23. Notes & Limitations in the Test Version

- Some captain‑specific pages (e.g. **My Bookings**) are clearly marked as **“Coming soon”**.
- Certain admin features may still be in alpha and can change without notice.
- This manual is based on the current code. 


