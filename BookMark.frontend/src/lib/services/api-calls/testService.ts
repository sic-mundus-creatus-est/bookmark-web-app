import { user_roles } from "@/config/roles";
import { apiCall, GET } from "./api";

export const getRoleTestMessage = async (userRoles: string[]) => {
  let endpoint = "/test/guest-user-test"; // Defaults to guest

  if (userRoles.includes(user_roles.admin)) {
    endpoint = "/test/admin-test";
  } else if (userRoles.includes(user_roles.regular_user)) {
    endpoint = "/test/regular-user-test";
  }

  return await apiCall({ method: GET, endpoint: endpoint });
};
