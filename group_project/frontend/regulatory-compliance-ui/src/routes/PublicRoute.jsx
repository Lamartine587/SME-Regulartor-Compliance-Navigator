

import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function PublicRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : children;
}