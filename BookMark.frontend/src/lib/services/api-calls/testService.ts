import { roles } from "@/config/roles";
import { apiCall } from "./api";

export const getRoleTestMessage = async (userRoles: string[]) => {
  let endpoint = "/test/guest-user-test"; // Defaults to guest

  if (userRoles.includes(roles.admin)) {
    endpoint = "/test/admin-test";
  } else if (userRoles.includes(roles.regular_user)) {
    endpoint = "/test/regular-user-test";
  }

  try {
    const data = await apiCall(endpoint, "GET", null);
    return data;
  } catch (error) {
    throw new Error("Failed to fetch role message: " + error);
  }
};
