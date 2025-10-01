import {
  IconBrandFacebook,
  IconBrandX,
  IconBrandYoutube,
  type IconProps,
} from "@tabler/icons-react";

export interface SocialLink {
  icon: React.ComponentType<IconProps>;
  link: string;
}

export interface NavItems {
  name: string;
  link: string;
}

export const socialLinks: SocialLink[] = [
  {
    icon: IconBrandFacebook,
    link: "/",
  },
  {
    icon: IconBrandX,
    link: "/",
  },
  {
    icon: IconBrandYoutube,
    link: "/",
  },
];

export const navItems = [
  {
    name: "About Us",
    link: "/about-us",
  },
  {
    name: "Visa",
    link: "/visa",
  },
  {
    name: "Countries",
    link: "/country",
  },
  {
    name: "FAQ",
    link: "/faq",
  },
  {
    name: "Contact Us",
    link: "/",
  },
];
