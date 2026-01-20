import { Pie } from "./Pie";
import { getAuthUser } from "../lib/auth";

export function PieContinuacao() {
  const authUser = getAuthUser();
  return <Pie />;
}
