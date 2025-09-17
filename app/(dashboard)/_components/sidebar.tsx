import { Logo } from "./logo";
import { SidebarRoutes } from "./sidebar-routes";
export const Sidebar = () => {
  return (
    <div
      className="h-full border-r flex flex-col 
        overflow-y-auto bg-white shadow-sm"
    >
      <div className="p-1 md:p-2 border-b flex items-center justify-center">
        <Logo />
      </div>
      <div className="flex flex-col w-full">
        <SidebarRoutes />
      </div>
    </div>
  );
};
