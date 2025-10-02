"use client";

import { navItems } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "motion/react";
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
                    <Link
                      href={item.link}
                      className="font-semibold"
                      prefetch={false}
                    >
                      {item.name}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/student-login" className="hidden md:block">
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
              <Button variant="secondary" className="cursor-pointer bg-accent">
                <Menu className="text-white size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-accent">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={300}
                    height={300}
                    draggable={false}
                  />
                </motion.div>
              </SheetHeader>

              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5 items-start justify-center p-2"
              >
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.name}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                      delay: i * 0.12,
                    }}
                  >
                    <Link
                      href={item.link}
                      className="text-4xl font-semibold text-white"
                      prefetch={false}
                    >
                      {item.name}
                      <motion.div
                        className="h-[3px] bg-primary origin-left will-change-transform"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                          delay: i * 0.12 + 0.15,
                        }}
                      />
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <SheetFooter>
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.5,
                  }}
                  className=" w-full "
                >
                  <Button
                    type="submit"
                    className="cursor-pointer text-lg font-semibold w-full"
                  >
                    Login
                  </Button>
                </motion.div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
