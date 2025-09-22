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
