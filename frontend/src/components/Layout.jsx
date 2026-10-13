import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

/**
 * Wraps every logged-in page. The nav bar renders once here, and the current
 * page appears where <Outlet /> is, so no individual page needs to change to
 * get the navigation.
 */
export default function Layout() {
  return (
    <>
      <NavBar />
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
