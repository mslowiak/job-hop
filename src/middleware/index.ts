import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerInstance } from "../db/supabase.client.ts";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create Supabase server instance
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });
  locals.supabase = supabase;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // IMPORTANT: Always get user session first before any other operations
  // Use getSession() instead of getUser() to avoid race conditions with cookie setting
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    locals.user = {
      email: session.user.email,
      id: session.user.id,
    };
  } else {
    // Redirect to login for protected routes
    const redirectUrl =
      url.pathname === "/" ? "/auth/login" : `/auth/login?redirect=${encodeURIComponent(url.pathname)}`;
    return redirect(redirectUrl);
  }

  return next();
});
