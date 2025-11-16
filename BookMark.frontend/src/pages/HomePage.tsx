// import { useContext, useState } from "react";
// import { getRoleTestMessage } from "@/lib/services/api-calls/testService";

// import { AuthContext } from "@/lib/contexts/authContext";
// import { Button } from "@/components/ui/button";

// export function HomePage() {
//   const auth = useContext(AuthContext);
//   const [message, setMessage] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   const fetchRoleMessage = async () => {
//     setLoading(true);
//     setError(null);
//     setMessage(null);
//     try {
//       const userRoles = auth?.user?.role ?? [];

//       const data = await getRoleTestMessage(userRoles);
//       setMessage(data.message);
//     } catch (err: any) {
//       setError(err.message ?? "Failed to fetch message");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col place-items-center p-4 space-y-2 text-accent">
//       <h1 className="text-4xl font-semibold">
//         Welcome back,{" "}
//         <b>
//           <i>{auth?.user?.username ?? "anonymous user"}</i>
//         </b>
//         !
//       </h1>
//       <Button
//         onClick={fetchRoleMessage}
//         className="text-lg font-bold bg-accent"
//       >
//         Test Role Access
//       </Button>
//       {loading && <p>Loading response...</p>}
//       {error && <p className="text-red-600">{error}</p>}
//       {message && <p className="text-green-600 font-bold text-lg">{message}</p>}
//     </div>
//   );
// }
