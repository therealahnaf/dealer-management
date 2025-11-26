
import {
    Home,
    Building2,
    Package,
    ShoppingCart,
    FileText,
    Users,
    Settings,
    LogOut,
    ChevronUp,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "../ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback } from "../ui/avatar"

// Menu items.
const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Dealers', href: '/admin/dealers', icon: Users },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'All Purchase Orders', href: '/admin/purchase-orders', icon: ShoppingCart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const buyerNavigation = [
    { name: 'Dealer Profile', href: '/dealer', icon: Building2 },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
    { name: 'Invoices', href: '/invoices', icon: FileText },
];

export function AppSidebar() {
    const location = useLocation()
    const { user, logout } = useAuth()

    if (!user) return null

    const navigation = user.role === 'admin' ? adminNavigation : buyerNavigation

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand-orange text-sidebar-primary-foreground">
                                    <img src="/ask_logo_transparent.png" alt="Logo" className="size-6" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Dealer Platform</span>
                                    <span className="truncate text-xs">ASK International</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigation.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.href)} tooltip={item.name}>
                                        <Link to={item.href}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarFallback className="rounded-lg">
                                            {(user.full_name || user.email || "U").substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user.full_name || "User"}</span>
                                        <span className="truncate text-xs">{user.email}</span>
                                    </div>
                                    <ChevronUp className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            >
                                <DropdownMenuItem onClick={logout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
