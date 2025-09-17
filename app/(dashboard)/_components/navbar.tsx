import { NavbarRoutes } from "@/components/navbar-routes";
import { MobileSidebar } from "./mobile-sidebar";
import Image from "next/image";
import Link from "next/link";
// import StudentBadge from "@/components/StudentBadge";

export const Navbar = () => {
  return (
    <div className="p-3 md:p-4 border-b w-full flex items-center justify-between bg-white shadow-sm gap-2 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <MobileSidebar />
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <Image src="/techra.png" alt="Techra Logo" width={32} height={32} />
        </Link>
        <span className="font-semibold text-lg md:text-xl truncate">
          Welcome to Techra Learning Center
        </span>
      </div>
      <NavbarRoutes />
    </div>
  );
};
