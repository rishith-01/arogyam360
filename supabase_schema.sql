
-- Create the medical_reports table
create table public.medical_reports (
  id uuid default gen_random_uuid() primary key,
  patient_id text not null, -- Links to Firebase UID
  doctor_id text not null,  -- Links to Firebase UID (Doctor)
  report_name text,
  report_type text,
  test_date timestamp with time zone,
  file_url text,
  file_path text,
  file_type text,
  extracted_text text,
  biomarkers jsonb,
  overall_risk text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
-- Note: Since the backend uses the Service Role Key and Firebase Auth, 
-- it will bypass these policies. These are placeholders for if you switch 
-- to Supabase Auth in the future.
alter table public.medical_reports enable row level security;

-- Create the Storage Bucket
insert into storage.buckets (id, name, public) 
values ('reports', 'reports', true); -- Set to true for easier access via publicUrl, or false if strictly proxied

-- Storage Policies (Optional if using Service Role)
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'reports' );

create policy "Authenticated Upload" 
on storage.objects for insert 
with check ( bucket_id = 'reports' );
