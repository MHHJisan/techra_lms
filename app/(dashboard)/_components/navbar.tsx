import { NavbarRoutes } from "@/components/navbar-routes";
import { MobileSidebar } from "./mobile-sidebar";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="p-3 md:p-4 border-b w-full flex items-center justify-between bg-white shadow-sm gap-2 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <MobileSidebar />
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Image src="/techra.png" alt="Techra Logo" width={32} height={32} />
          <span className="hidden sm:inline text-lg md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate mb-2">
            Hello there, Welcome to Techra Learning Center
          </span>
        </Link>
      </div>
      <NavbarRoutes />
    </div>
  );
};
