import apiClient from "@/lib/api";
import { Notice } from "@/types";
import { useEffect, useState } from "react";
import { StickyBanner } from "../ui/sticky-banner";

export default function Banner() {
  const [notice, setNotice] = useState<Notice>();

  useEffect(() => {
    const fetchNotice = async () => {
      const response = await apiClient.associate.notice.get();
      setNotice(response);
    };

    fetchNotice();
  }, []);

  return (
    <StickyBanner className="flex flex-col items-start justify-center bg-gradient-to-b from-blue-500 to-blue-600">
      <p className="mx-0 max-w-[90%] text-white font-bold drop-shadow-md">
        {notice?.title}
      </p>
      <p className="mx-0 max-w-[90%] text-white text-sm drop-shadow-md">
        {notice?.description}
      </p>
    </StickyBanner>
  );
}
