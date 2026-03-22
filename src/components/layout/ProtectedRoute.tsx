import type { JSX } from "react";
import { useAuthStore } from "../../store/authStore";
import AuthOverlay from "../ui/AuthOverlay";

export default function ProtectedRoute({children} : {children : JSX.Element} ) {
     const {user} = useAuthStore();

      
      return (
        <div className="relative">

            <div  className={!user ? "blur-sm pointer-events-none" : ""}>
                {children}
            </div>

             {!user && <AuthOverlay />}

        </div>
      )
}