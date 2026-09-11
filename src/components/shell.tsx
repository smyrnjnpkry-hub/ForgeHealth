import { Onboarding } from "@/components/onboarding";
import { Plant } from "@/components/plant";
import { Button } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { currentStreak, plantStage } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bell, Compass, House, User } from "lucide-react";
import { useEffect } from "react";
import { hydrateStore } from "@/lib/store";
import { setMasterVolume, unlockAudio } from "@/lib/audio";
import { unlockTts } from "@/lib/tts";

const TABS = [
  { to: "/", label: "Home", icon: House },
  { to: "/habits", label: "Habits", icon: BarChart3 },
  { to: "/challenge", label: "Challenge", icon: Compass },
  { to: "/mood", label: "Mood", icon: Bell },
  { to: "/you", label: "You", icon: User },
] as const;

export function StoreBoot() {
  const theme = useAppStore((s) => s.settings.theme);
  const volume = useAppStore((s) => s.settings.volume);

  useEffect(() => {
    hydrateStore();
    const finish = () => {
      const s = useAppStore.getState();
      if (!s.hasSeeded) s.seedIfNeeded();
      if (!s.hydrated) s.setHydrated();
    };
    const t = window.setTimeout(finish, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    setMasterVolume(volume);
  }, [volume]);

  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      unlockTts();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  return null;
}

function Splash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg">
      <div className="relative size-20 overflow-hidden rounded-3xl bg-sun">
        <div className="absolute -right-3 bottom-0 size-16 rounded-full bg-sun/0 shadow-[inset_0_0_0_9999px_#f5c400]" />
        <div className="absolute right-[-6px] bottom-[-10px] size-[58px] rounded-full bg-bg" />
      </div>
      <div className="text-center">
        <div className="text-xl font-semibold tracking-tight">ForgeHealth</div>
        <div className="text-sm text-muted">Build your strength</div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingDone = useAppStore((s) => s.settings.onboardingDone);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideNav = pathname.startsWith("/run/") || !onboardingDone;
  const alerts = useAppStore((s) => s.alerts);
  const dismiss = useAppStore((s) => s.dismissAlert);
  const startRun = useAppStore((s) => s.startRun);
  const navigate = useNavigate();
  const completions = useAppStore((s) => s.completions);
  const streak = currentStreak(completions);
  const plant = plantStage(streak);

  if (!hydrated) return <Splash />;
  if (!onboardingDone) return <Onboarding />;

  return (
    <div className="min-h-dvh w-full bg-sunken">
      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-bg sm:shadow-card",
          !hideNav && "pb-24",
        )}
      >
        {alerts[0] ? (
          <div className="mx-4 mt-3 rounded-2xl bg-sun px-4 py-3 text-sun-ink shadow-card">
            <div className="flex items-start gap-3">
              <span className="text-xl">{alerts[0].emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{alerts[0].title}</div>
                <div className="text-sm opacity-80">{alerts[0].body}</div>
              </div>
              <button
                className="text-xs font-medium opacity-70"
                onClick={() => dismiss(alerts[0].id)}
              >
                Dismiss
              </button>
            </div>
            {alerts[0].routineId ? (
              <Button
                size="sm"
                variant="solid"
                className="mt-2"
                onClick={() => {
                  const rid = alerts[0].routineId!;
                  dismiss(alerts[0].id);
                  startRun(rid);
                  void navigate({ to: "/run/$id", params: { id: rid } });
                }}
              >
                Start now
              </Button>
            ) : null}
          </div>
        ) : null}
        <div className="flex-1">{children}</div>
        {!hideNav ? (
          <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-lg -translate-x-1/2 border-t border-border bg-bg/95 backdrop-blur-md">
            <div className="flex items-center justify-around px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {TABS.map((tab) => {
                const active =
                  tab.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(tab.to);
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={cn(
                      "flex min-h-12 min-w-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-3 text-[11px] font-medium",
                      active ? "text-fg" : "text-faint",
                    )}
                  >
                    {tab.to === "/challenge" && tab.icon ? (
                      <tab.icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                    ) : (
                      <tab.icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                    )}
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
