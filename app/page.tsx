import { redirect } from "next/navigation";

export default function Home() {
  // Middleware bo poskrbel za preusmeritev na /login če uporabnik ni prijavljen
  redirect("/dashboard");
}
