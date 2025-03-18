import { redirect } from "next/navigation";
import Spinners from "../app/components/spinner/Spinner";

export default function Home() {
  redirect("/login");
  return (
    <div>
      <Spinners />
    </div>
  );
}
