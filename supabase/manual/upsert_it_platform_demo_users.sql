do $$
begin

update auth.users
set
  encrypted_password = crypt('182536', gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  updated_at = now(),
  raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'provider', 'email',
    'providers', jsonb_build_array('email'),
    'platform_role', case lower(email)
      when 'itadmin@sstipos.local' then 'it_admin'
      when 'itsupport@sstipos.local' then 'it_support'
    end
  ),
  raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
    'full_name', case lower(email)
      when 'itadmin@sstipos.local' then 'SSTiPOS IT Admin'
      when 'itsupport@sstipos.local' then 'SSTiPOS IT Support'
    end
  )
where lower(email) in ('itadmin@sstipos.local', 'itsupport@sstipos.local');

update public.users_profiles
set
  full_name = case lower(email)
    when 'itadmin@sstipos.local' then 'SSTiPOS IT Admin'
    when 'itsupport@sstipos.local' then 'SSTiPOS IT Support'
  end,
  platform_role = case lower(email)
    when 'itadmin@sstipos.local' then 'it_admin'::platform_role
    when 'itsupport@sstipos.local' then 'it_support'::platform_role
  end,
  is_active = true
where lower(email) in ('itadmin@sstipos.local', 'itsupport@sstipos.local');

insert into auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  u.id::text,
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  coalesce(u.created_at, now()),
  now()
from auth.users u
where lower(u.email) in ('itadmin@sstipos.local', 'itsupport@sstipos.local')
on conflict (provider_id, provider) do update
set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  updated_at = now();

end
$$;
