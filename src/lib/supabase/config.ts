export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase chưa được cấu hình. Vui lòng cập nhật NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY trong .env.local.",
    );
  }

  return { url: url.replace(/\/$/, ""), publishableKey };
}

export function getSupabaseServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "Thiếu SUPABASE_SERVICE_ROLE_KEY. Vui lòng thêm service role key vào .env.local và biến môi trường deploy.",
    );
  }

  return serviceRoleKey;
}
