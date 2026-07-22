function normalizeEnvValue(value?: string) {
  return value?.trim().replace(/^['"]|['"]$/g, "");
}

export function getSupabaseUrl() {
  const url = normalizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!url) {
    throw new Error(
      "Supabase chưa được cấu hình. Vui lòng cập nhật NEXT_PUBLIC_SUPABASE_URL trong biến môi trường.",
    );
  }

  return url.replace(/\/$/, "");
}

export function getSupabaseConfig() {
  const url = getSupabaseUrl();
  const publishableKey = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase chưa được cấu hình. Vui lòng cập nhật NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY trong biến môi trường.",
    );
  }

  return { url, publishableKey };
}

export function getSupabaseServiceRoleKey() {
  const serviceRoleKey = normalizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!serviceRoleKey) {
    throw new Error(
      "Thiếu SUPABASE_SERVICE_ROLE_KEY. Vui lòng thêm service role key vào .env.local và biến môi trường deploy.",
    );
  }

  return serviceRoleKey;
}
