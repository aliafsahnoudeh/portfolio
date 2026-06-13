"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useGameStore } from "@/domains/game/services/state/store";
import { audio } from "@/domains/game/services/audio/audio-manager";

type View = "main" | "options";

export function MainMenu() {
  const [view, setView] = useState<View>("main");
  return view === "main" ? (
    <MainView openOptions={() => setView("options")} />
  ) : (
    <OptionsView back={() => setView("main")} />
  );
}

function MenuFrame({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 px-4">
      <h2 className="tm-logo text-5xl sm:text-6xl">{title}</h2>
      <div className="tm-panel min-w-72 px-10 py-8">{children}</div>
      <p className="text-ash text-xs tracking-widest">{hint}</p>
    </div>
  );
}

function MainView({ openOptions }: { openOptions: () => void }) {
  const setPhase = useGameStore((state) => state.setPhase);
  const router = useRouter();
  const t = useTranslations("menu");
  const [selected, setSelected] = useState(0);

  const items = [
    { label: t("startGame"), run: () => setPhase("vehicleSelect") },
    { label: t("projects"), run: () => router.push("/projects") },
    { label: t("driverBio"), run: () => router.push("/bio") },
    { label: t("contact"), run: () => router.push("/contact") },
    { label: t("options"), run: openOptions },
  ];
  const count = items.length;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
          event.preventDefault();
          audio.play("menuMove");
          setSelected((i) => (i - 1 + count) % count);
          break;
        case "ArrowDown":
          event.preventDefault();
          audio.play("menuMove");
          setSelected((i) => (i + 1) % count);
          break;
        case "Enter":
        case "Space":
          event.preventDefault();
          audio.play("menuConfirm");
          document.getElementById(`tm-menu-${selected}`)?.click();
          break;
        case "Escape":
          setPhase("boot");
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, selected, setPhase]);

  return (
    <MenuFrame title="Ali's Portfolio" hint={t("menuHint")}>
      <ul className="space-y-4 text-center">
        {items.map((item, index) => (
          <li key={item.label}>
            <button
              id={`tm-menu-${index}`}
              type="button"
              onClick={item.run}
              onMouseEnter={() => setSelected(index)}
              onFocus={() => setSelected(index)}
              className={`tm-display text-2xl transition-colors ${
                index === selected ? "text-ember" : "text-bone/70"
              }`}
            >
              <span
                aria-hidden
                className={`me-3 ${index === selected ? "opacity-100" : "opacity-0"}`}
              >
                ▸
              </span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </MenuFrame>
  );
}

function OptionsView({ back }: { back: () => void }) {
  const t = useTranslations("options");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const muted = useGameStore((state) => state.muted);
  const crt = useGameStore((state) => state.crt);
  const toggleMute = useGameStore((state) => state.toggleMute);
  const toggleCrt = useGameStore((state) => state.toggleCrt);
  const [selected, setSelected] = useState(0);

  const rows = [
    {
      label: t("language"),
      value: locale === "fa" ? "فارسی" : "EN",
      run: () =>
        router.replace(pathname, { locale: locale === "fa" ? "en" : "fa" }),
    },
    { label: t("sound"), value: muted ? t("off") : t("on"), run: toggleMute },
    { label: t("crt"), value: crt ? t("on") : t("off"), run: toggleCrt },
    { label: t("back"), value: "", run: back },
  ];
  const count = rows.length;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
          event.preventDefault();
          audio.play("menuMove");
          setSelected((i) => (i - 1 + count) % count);
          break;
        case "ArrowDown":
          event.preventDefault();
          audio.play("menuMove");
          setSelected((i) => (i + 1) % count);
          break;
        case "Enter":
        case "Space":
        case "ArrowLeft":
        case "ArrowRight":
          event.preventDefault();
          audio.play("menuConfirm");
          document.getElementById(`tm-option-${selected}`)?.click();
          break;
        case "Escape":
          back();
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [back, count, selected]);

  return (
    <MenuFrame title={t("title")} hint={t("back") + " — ESC"}>
      <ul className="min-w-64 space-y-4">
        {rows.map((row, index) => (
          <li key={row.label}>
            <button
              id={`tm-option-${index}`}
              type="button"
              onClick={row.run}
              onMouseEnter={() => setSelected(index)}
              onFocus={() => setSelected(index)}
              className={`tm-display flex w-full items-center justify-between gap-10 text-xl ${
                index === selected ? "text-ember" : "text-bone/70"
              }`}
            >
              <span>
                <span
                  aria-hidden
                  className={`me-3 ${index === selected ? "opacity-100" : "opacity-0"}`}
                >
                  ▸
                </span>
                {row.label}
              </span>
              <span className="text-flame">{row.value}</span>
            </button>
          </li>
        ))}
      </ul>
    </MenuFrame>
  );
}
