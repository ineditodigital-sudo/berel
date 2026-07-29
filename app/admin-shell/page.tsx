import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import "../admin/admin.css";

/**
 * Cascarón del CMS para el export estático.
 *
 * `/admin` exige autenticación en el servidor, así que en un build de
 * producción no se puede renderizar para generar `admin-app.html`, que es el
 * archivo que sirve el puerto PHP. Esta ruta dibuja el mismo panel sin datos:
 * todo lo que muestra llega de `/api/admin/*`, que sigue exigiendo sesión y
 * responde 401 sin ella.
 *
 * En el hosting real esta ruta no se publica: el export la convierte en
 * `admin-app.html`, que `.htaccess` bloquea y `admin.php` sirve solo después
 * de validar la sesión.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Berel Commerce — Administración",
  robots: { index: false, follow: false },
};

export default function AdminShellPage() {
  return <AdminDashboard userName="Equipo Berel" />;
}
