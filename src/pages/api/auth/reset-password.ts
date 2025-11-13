import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client.ts";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
  code: z.string().min(1, "Kod resetowania jest wymagany"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane",
          details: validation.error.errors,
        }),
        {
          status: 400,
        },
      );
    }

    const { password, code } = validation.data;

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Exchange the code for a session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.session) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy lub wygasły kod resetowania hasła",
        }),
        {
          status: 400,
        },
      );
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zaktualizowane",
      }),
      {
        status: 200,
      },
    );
  } catch {
    return new Response(JSON.stringify({ error: "Wystąpił błąd serwera" }), {
      status: 500,
    });
  }
};
