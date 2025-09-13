import { user_roles } from "@/config/roles";
import { apiCall, GET } from "./api";

export const getRoleTestMessage = async (userRoles: string[]) => {
  let endpoint = "/api/test/guest-user-test"; // Defaults to guest

  if (userRoles.includes(user_roles.admin)) {
    endpoint = "/api/test/admin-test";
  } else if (userRoles.includes(user_roles.regular_user)) {
    endpoint = "/api/test/regular-user-test";
  }

  return await apiCall({ method: GET, endpoint: endpoint });
};
