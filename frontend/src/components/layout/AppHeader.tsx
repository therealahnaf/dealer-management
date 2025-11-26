import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { useLocation } from "react-router-dom";

const Badge: React.FC<{ value?: number; className?: string }> = ({ value, className }) => {
    if (!value) return null;
    return (
        <span
            className={`absolute -top-1 -right-1 inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-brand-orange text-white text-xs font-bold px-1 ${className}`}
        >
            {value > 99 ? "99+" : value}
        </span>
    );
};

export default function AppHeader() {
    const { itemCount } = useCart();
    const location = useLocation();

    // Simple breadcrumb logic based on path
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathSegments.map((segment, index) => {
                        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                        const isLast = index === pathSegments.length - 1;
                        const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

                        return (
                            <React.Fragment key={href}>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{title}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-2">
                <Link
                    to="/cart"
                    className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                    aria-label="Cart"
                >
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <Badge value={itemCount} />
                </Link>
            </div>
        </header>
    );
}
