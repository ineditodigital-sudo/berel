import { requireAdminApi } from "@/lib/admin-auth";

/**
 * Sonda de sesión para el modo edición de la tienda.
 *
 * El storefront la consulta para saber si quien navega puede editar. No
 * devuelve token CSRF porque este despliegue no usa sesiones con cookie: la
 * autenticación viaja en las cabeceras que inyecta el hosting.
 */
export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return Response.json({ authenticated: false });
  return Response.json({ authenticated: true, user: auth.email, csrf: "" });
}
