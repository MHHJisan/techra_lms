import { NavbarRoutes } from "@/components/navbar-routes";
import { MobileSidebar } from "./mobile-sidebar";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm gap-3">
      <MobileSidebar />
      <Link href="/" className="flex items-center gap-2">
        <Image src="/techra.png" alt="Techra Logo" width={32} height={32} />
        <span className="hidden sm:inline text-lg md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Hello there, Welcome to Techra Learning Center
        </span>
      </Link>
      <NavbarRoutes />
    </div>
  );
};
