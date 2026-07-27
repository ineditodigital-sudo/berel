import { getChatGPTUser, requireChatGPTUser } from "@/app/chatgpt-auth";

const DEFAULT_ADMIN_EMAILS = ["ineditodigital@gmail.com"];

function allowedEmails(): string[] {
  const configured = process.env.ADMIN_EMAILS?.split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_ADMIN_EMAILS;
}

/**
 * Omite la autenticación del CMS solo en desarrollo local y solo si se pide
 * explícitamente. Se exigen las dos condiciones a propósito: si `ADMIN_PREVIEW`
 * se filtrara a producción, `NODE_ENV` seguiría siendo "production" y el CMS
 * continuaría protegido.
 */
function isLocalPreview(): boolean {
  return (
    process.env.ADMIN_PREVIEW === "true" &&
    process.env.NODE_ENV === "development"
  );
}

export async function requireAdminPage(returnTo = "/admin") {
  if (isLocalPreview()) {
    return {
      displayName: "Equipo Berel",
      email: DEFAULT_ADMIN_EMAILS[0],
      fullName: "Equipo Berel",
    };
  }
  const user = await requireChatGPTUser(returnTo);
  if (!allowedEmails().includes(user.email.toLowerCase())) {
    throw new Error("Esta cuenta no tiene acceso al CMS.");
  }
  return user;
}

export async function requireAdminApi(): Promise<
  { ok: true; email: string } | { ok: false; response: Response }
> {
  if (isLocalPreview()) {
    return { ok: true, email: DEFAULT_ADMIN_EMAILS[0] };
  }
  const user = await getChatGPTUser();
  if (!user) {
    return {
      ok: false,
      response: Response.json(
        { error: "Inicia sesión para administrar la tienda." },
        { status: 401 },
      ),
    };
  }
  if (!allowedEmails().includes(user.email.toLowerCase())) {
    return {
      ok: false,
      response: Response.json(
        { error: "Tu cuenta no tiene permisos de administración." },
        { status: 403 },
      ),
    };
  }
  return { ok: true, email: user.email };
}
