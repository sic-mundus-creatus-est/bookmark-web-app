import { roles } from "@/config/roles";
import { apiCall, GET } from "./api";

export const getRoleTestMessage = async (userRoles: string[]) => {
  let endpoint = "/test/guest-user-test"; // Defaults to guest

  if (userRoles.includes(roles.admin)) {
    endpoint = "/test/admin-test";
  } else if (userRoles.includes(roles.regular_user)) {
    endpoint = "/test/regular-user-test";
  }

  return await apiCall({ method: GET, endpoint: endpoint });
};
