-- Supabase Migration: Database Schema for WheelTrack Pro

-- 1. Enable pg_cron (if you want the cron job to run directly from Postgres)
create extension if not exists pg_cron;

-- 2. Trucks Table
create table public.trucks (
    id uuid default gen_random_uuid() primary key,
    "truckNumber" text not null,
    owner text,
    "ownerPhone" text,
    driver text,
    "driverPhone" text,
    type text,
    "currentKM" bigint default 0,
    status text default 'OK',
    "nextDueDate" date,
    "lastAlignmentDate" date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Alignments Table
create table public.alignments (
    id uuid default gen_random_uuid() primary key,
    "truckId" uuid references public.trucks(id) on delete cascade,
    "truckNumber" text,
    "alignmentDate" date not null,
    "currentKM" bigint default 0,
    "nextDueDate" date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Bills Table
create table public.bills (
    id uuid default gen_random_uuid() primary key,
    "invoiceNo" text,
    "truckNumber" text,
    "truckOwnerName" text,
    "ownerMobNo" text,
    "altOwnerMobNo" text,
    "truckDriverName" text,
    "driverMobNo" text,
    "date" date,
    "invoiceCategory" text,
    "items" jsonb default '[]'::jsonb,
    "totalAmount" numeric default 0,
    "paymentStatus" text default 'Pending',
    "advancePaid" numeric default 0,
    "balanceDue" numeric default 0,
    "paidAt" timestamp with time zone,
    "lastPaymentAt" timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Reminder Logs Table (for Duplicate Prevention)
create table public.reminder_logs (
    id uuid default gen_random_uuid() primary key,
    "truckId" uuid references public.trucks(id) on delete cascade,
    "truckNumber" text,
    "driverPhone" text,
    driver text,
    "reminderDate" date,
    "reminderDay" integer,
    "nextDueDate" date,
    status text,
    "whatsappMessageId" text,
    error jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Setup Row Level Security (RLS)
-- To allow the React App to read/write. 
-- *WARNING*: These policies are extremely permissive for development.
-- You should restrict them to authenticated users in production.

alter table public.trucks enable row level security;
create policy "Enable all access" on public.trucks for all using (true) with check (true);

alter table public.alignments enable row level security;
create policy "Enable all access" on public.alignments for all using (true) with check (true);

alter table public.bills enable row level security;
create policy "Enable all access" on public.bills for all using (true) with check (true);

alter table public.reminder_logs enable row level security;
create policy "Enable all access" on public.reminder_logs for all using (true) with check (true);
