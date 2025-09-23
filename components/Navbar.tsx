import { navItems } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu } from "lucide-react";

const Navbar = () => {
  return (
    <div className="bg-[#f6adad]">
      <div className="max-w-7xl mx-auto p-3">
        <nav className="flex justify-between items-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={230}
              height={230}
              draggable={false}
            />
          </Link>

          {/* Desktop Menu */}
          <NavigationMenu viewport={false} className="hidden md:block">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink
                    asChild
                    className={
                      navigationMenuTriggerStyle() +
                      " bg-[#f6adad] text-primary text-md hover:text-white duration-300"
                    }
                  >
                    <Link href={item.link} className="font-semibold">
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/" className="hidden md:block">
            <Button
              variant="default"
              className="cursor-pointer hover:text-white font-extrabold duration-300 border-2 border-accent shadow-2xl hover:scale-110 transition-all"
            >
              Login
            </Button>
          </Link>

          {/* Mobile Menu */}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" className="cursor-pointer">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={230}
                  height={230}
                  draggable={false}
                />
              </SheetHeader>

              <div className="flex flex-col gap-2 items-start justify-center p-2">
                {navItems.map((item) => (
                  <Link
                    href={item.link}
                    key={item.name}
                    className="text-lg font-semibold"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <SheetFooter>
                <Button
                  type="submit"
                  className="cursor-pointer text-lg font-semibold"
                >
                  Login
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
