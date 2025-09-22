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
    link: "https://www.facebook.com/Rightlinksimmigration",
  },
  {
    icon: IconBrandX,
    link: "https://x.com/rightlinks",
  },
  {
    icon: IconBrandYoutube,
    link: "https://www.youtube.com/c/RightlinksImmigration",
  },
];

export const navItems = [
  {
    name: "About Us",
    link: "/",
  },
  {
    name: "Visa",
    link: "/",
  },
  {
    name: "Countries",
    link: "/",
  },
  {
    name: "College",
    link: "/",
  },
  {
    name: "Contact Us",
    link: "/",
  },
];
