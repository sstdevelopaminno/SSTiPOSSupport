import { redirect } from "next/navigation";

export default function HomePage() {
  const surface = String(process.env.APP_SURFACE ?? "it_admin").trim().toLowerCase();
  redirect(surface === "pos" ? "/login/store" : "/it-admin/login");
}
