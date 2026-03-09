import { Camera, Settings, Activity, FileText, LayoutDashboard, Cpu, BookOpen, Shield } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Camera Config", url: "/camera", icon: Camera },
  { title: "Module Settings", url: "/modules", icon: Cpu },
  { title: "Logs", url: "/logs", icon: FileText },
  { title: "Provider Settings", url: "/provider", icon: Shield },
  { title: "Tech Spec", url: "/spec", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary text-glow" />
          {!collapsed && (
            <span className="font-mono font-bold text-primary text-glow text-sm tracking-wider">
              UVC OVERRIDE
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-xs tracking-widest text-muted-foreground">
            {!collapsed && "SYSTEM"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-secondary"
                      activeClassName="bg-secondary text-primary font-medium border-glow border-l-2"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
