import { redirect } from "next/navigation";

export default function LoginRootPage() {
  const surface = String(process.env.APP_SURFACE ?? "it_admin").trim().toLowerCase();
  redirect(surface === "pos" || surface === "all" ? "/login/store" : "/it-admin/login");
}
