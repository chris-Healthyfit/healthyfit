"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CLUB_LOGIN_PATH,
  CLUB_TITLE_CLICKS,
  CLUB_TITLE_WINDOW_MS,
} from "@/lib/club-config";

type Props = {
  children: React.ReactNode;
};

/** 5 clics rapides sur la zone → portail club */
export default function ClubSecretTrigger({ children }: Props) {
  const router = useRouter();
  const clicks = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    clicks.current += 1;
    if (timer.current) clearTimeout(timer.current);

    if (clicks.current >= CLUB_TITLE_CLICKS) {
      clicks.current = 0;
      router.push(CLUB_LOGIN_PATH);
      return;
    }

    timer.current = setTimeout(() => {
      clicks.current = 0;
    }, CLUB_TITLE_WINDOW_MS);
  }, [router]);

  return (
    <div onClick={handleClick} style={{ cursor: "default" }}>
      {children}
    </div>
  );
}
