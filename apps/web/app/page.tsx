import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the Academic Hub as the default dashboard view
  redirect("/academic");
}
