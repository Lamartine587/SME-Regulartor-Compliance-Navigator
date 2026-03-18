import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function ProtectedRoute({children}) {
    if(!isLoggedIn()){
        return<Navigate to="/SignIn" replace/>
    }
    return children
}