import { Pie } from "./Pie";
import { getAuthUser } from "../lib/auth";

export function PieContinuacao2() {
  const authUser = getAuthUser();
  return <Pie />;
}
