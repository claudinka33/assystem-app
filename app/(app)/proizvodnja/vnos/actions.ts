"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function vnesiProizvodnjo(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const datum = formData.get("datum") as string;
  const izmena = formData.get("izmena") as string;
  const delavec_id = formData.get("delavec_id") as string;
  const stroj_id = formData.get("stroj_id") as string;
  const izdelek_id = formData.get("izdelek_id") as string;
  const zica_id = (formData.get("zica_id") as string) || null;
  const ure_dela = Number(formData.get("ure_dela") ?? 7);
  const kolicina_kos = Number(formData.get("kolicina_kos") ?? 0);
  const norma_kos = Number(formData.get("norma_kos") ?? 0);
  const nalog = (formData.get("nalog") as string) || null;
  const opombe = (formData.get("opombe") as string) || null;

  const { error } = await supabase.from("proizvodnja").insert({
    datum,
    izmena,
    delavec_id,
    stroj_id,
    izdelek_id,
    zica_id,
    ure_dela,
    kolicina_kos,
    norma_kos,
    nalog,
    opombe,
    ustvaril_id: user.id,
  });

  if (error) {
    redirect(
      `/proizvodnja/vnos?error=${encodeURIComponent(
        "Vnos ni shranjen: " + error.message
      )}`
    );
  }

  revalidatePath("/proizvodnja/vnos");
  revalidatePath("/proizvodnja/tedensko");
  revalidatePath("/dashboard");
  redirect(
    `/proizvodnja/vnos?success=${encodeURIComponent(
      "Vnos shranjen v bazo (" + kolicina_kos + " kos)"
    )}`
  );
}
