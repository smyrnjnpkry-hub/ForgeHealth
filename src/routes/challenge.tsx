import { Button, Card } from "@/components/ui";
import { useAppStore } from "@/lib/store";
import { XP_LEVELS } from "@/lib/types";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Swords, Shield, TrendingUp, TrendingDown } from "lucide-react";

export const Route = createFileRoute("/challenge")({ component: Challenge });

function Challenge() {
  const account = useAppStore((s) => s.account);
  const challenge = useAppStore((s) => s.challenge);
  const monster = useAppStore((s) => s.monster);
  const setAccount = useAppStore((s) => s.setAccount);
  const startChallenge = useAppStore((s) => s.startChallenge);
  const checkInChallenge = useAppStore((s) => s.checkInChallenge);
  const recordRelapse = useAppStore((s) => s.recordRelapse);
  const spawnMonster = useAppStore((s) => s.spawnMonster);
  const damageMonster = useAppStore((s) => s.damageMonster);
  const adjustWillpower = useAppStore((s) => s.adjustWillpower);
  const addXp = useAppStore((s) => s.addXp);
  const [agreed, setAgreed] = useState(false);
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState("");
  const [buddyEmail, setBuddyEmail] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [buddyProgress, setBuddyProgress] = useState<any>(null);
  const [relapseNote, setRelapseNote] = useState("");
  const [showRelapseInput, setShowRelapseInput] = useState(false);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined" || !account || !challenge?.buddyEmail) return;
    const bc = new BroadcastChannel("forgehealth-challenge");
    bc.onmessage = (e) => {
      if (e.data.type === "check-in" || e.data.type === "challenge-started") {
        const buddyKey = account.id === "soumya" ? "forgehealth-buddy-jabir" : "forgehealth-buddy-soumya";
        const stored = localStorage.getItem(buddyKey);
        if (stored) setBuddyProgress(JSON.parse(stored));
      }
    };
    const buddyKey = account.id === "soumya" ? "forgehealth-buddy-jabir" : "forgehealth-buddy-soumya";
    const stored = localStorage.getItem(buddyKey);
    if (stored) setBuddyProgress(JSON.parse(stored));
    return () => bc.close();
  }, [account, challenge?.buddyEmail]);

  const currentLevel = XP_LEVELS.find((lvl) => challenge && challenge.xp >= lvl.minXp && challenge.xp <= lvl.maxXp) ?? XP_LEVELS[0];

  function handleBattle() {
    if (!challenge || challenge.willpower < 20) return;
    if (!monster) {
      spawnMonster();
      adjustWillpower(-20);
    } else {
      const damage = Math.floor(Math.random() * 30) + 20;
      damageMonster(damage);
      adjustWillpower(-10);
    }
  }

  function handleRelapse() {
    if (!challenge) return;
    recordRelapse(relapseNote.trim() || undefined);
    addXp(-50);
    setShowRelapseInput(false);
    setRelapseNote("");
  }

  if (!account) {
    return (
      <main className="px-5 pt-6 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Challenge</h1>
        <p className="mt-1 text-sm text-muted">Partner accountability</p>
        <Card className="mt-6 p-6">
          <h2 className="text-lg font-semibold mb-4">Choose Account</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => { setAccount({ id: "soumya", email: "smyrnjnpkry@gmail.com", displayName: "Soumya", createdAt: Date.now() }); setSelectedEmail("soumya"); }}>Soumya (smyrnjnpkry@gmail.com)</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => { setAccount({ id: "jabir", email: "mdjabirkhan6786@gmail.com", displayName: "Jabir", createdAt: Date.now() }); setSelectedEmail("jabir"); }}>Jabir (mdjabirkhan6786@gmail.com)</Button>
          </div>
        </Card>
      </main>
    );
  }

  if (!challenge) {
    if (!agreed) {
      return (
        <main className="px-5 pt-6 pb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Agreement</h1>
          <Card className="mt-6 p-6 space-y-4">
            <div className="space-y-3 text-sm"><p className="font-semibold">Before you start:</p><ul className="list-disc list-inside space-y-1 text-muted"><li>This is a personal wellness challenge (18+)</li><li>Progress is private unless you share it</li><li>Relapses are tracked without judgment</li><li>Your buddy can see your progress if you add them</li></ul></div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="size-4 accent-mint" /><span className="text-sm">I understand and agree (18+)</span></label>
            <Button variant="sun" className="w-full" disabled={!agreed} onClick={() => setAgreed(true)}>Continue</Button>
          </Card>
        </main>
      );
    }
    return (
      <main className="px-5 pt-6 pb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Start Challenge</h1>
        <Card className="mt-6 p-6 space-y-4">
          <div><label className="block text-sm font-medium mb-3">Duration</label><div className="grid grid-cols-2 gap-2">{[7, 30, 60, 90].map((d) => (<button key={d} type="button" onClick={() => setDuration(d)} className={`p-3 rounded-xl border-2 font-medium transition-all ${duration === d ? "border-mint bg-mint/10" : "border-border"}`}>{d} days</button>))}</div></div>
          <div><label className="block text-sm font-medium mb-2">Custom Duration (days)</label><input type="number" min="1" max="365" className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm" placeholder="e.g. 100" value={customDuration} onChange={(e) => setCustomDuration(e.target.value)} /></div>
          <div><label className="block text-sm font-medium mb-2">Buddy Email (optional)</label><input type="email" className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm" placeholder={selectedEmail === "soumya" ? "mdjabirkhan6786@gmail.com" : "smyrnjnpkry@gmail.com"} value={buddyEmail} onChange={(e) => setBuddyEmail(e.target.value)} /></div>
          <Button variant="sun" className="w-full" onClick={() => { const days = customDuration ? parseInt(customDuration, 10) : duration; if (days > 0 && days <= 365) startChallenge(days, buddyEmail || undefined); }}>Start {customDuration || duration}-day challenge</Button>
        </Card>
      </main>
    );
  }

  const progressPct = Math.min(100, ((challenge.xp - currentLevel.minXp) / (currentLevel.maxXp - currentLevel.minXp)) * 100);
  const monsterHpPct = monster ? (monster.currentHp / monster.maxHp) * 100 : 0;

  return (
    <main className="px-5 pt-6 pb-20">
      <h1 className="text-2xl font-semibold tracking-tight">Challenge</h1>
      <p className="mt-1 text-sm text-muted">{account.displayName} · {challenge.status}</p>

      <Card className="mt-6 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div><div className="text-2xl font-bold">{challenge.currentStreak}</div><div className="text-xs text-muted">Current Streak</div></div>
          <div><div className="text-2xl font-bold">{challenge.longestStreak}</div><div className="text-xs text-muted">Longest</div></div>
          <div><div className="text-2xl font-bold">{challenge.relapses.length}</div><div className="text-xs text-muted">Relapses</div></div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Level {currentLevel.level}: {currentLevel.name}</span>
            <span className="text-xs text-muted">{challenge.xp}/{currentLevel.maxXp} XP</span>
          </div>
          <div className="h-2 bg-sunken rounded-full overflow-hidden">
            <div className="h-full bg-mint transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Willpower</span>
            <span className="text-xs text-muted">{challenge.willpower}/100</span>
          </div>
          <div className="h-2 bg-sunken rounded-full overflow-hidden">
            <div className="h-full bg-sun transition-all duration-300" style={{ width: `${challenge.willpower}%` }} />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="sun" className="flex-1" onClick={checkInChallenge}>Check In (+30 XP)</Button>
          {!showRelapseInput ? (
            <Button variant="outline" className="flex-1" onClick={() => setShowRelapseInput(true)}>Record Relapse</Button>
          ) : (
            <Button variant="outline" className="flex-1" onClick={() => setShowRelapseInput(false)}>Cancel</Button>
          )}
        </div>
      </Card>

      {showRelapseInput && (
        <Card className="mt-4 p-4">
          <div className="text-sm font-medium mb-2">Relapse Note (optional)</div>
          <textarea value={relapseNote} onChange={(e) => setRelapseNote(e.target.value)} placeholder="What happened? What can you learn?" className="w-full h-20 rounded-xl border border-border bg-surface px-3 py-2 text-sm resize-none mb-3" />
          <div className="flex items-center gap-2 text-xs text-muted mb-3"><TrendingDown className="size-4 text-coral" /><span>This will subtract 50 XP and reset your streak to 0</span></div>
          <Button variant="outline" className="w-full" onClick={handleRelapse}>Confirm Relapse</Button>
        </Card>
      )}

      {monster && (
        <Card className="mt-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{monster.emoji}</div>
              <div>
                <div className="font-semibold">{monster.name}</div>
                <div className="text-xs text-muted">Level {monster.level} Boss</div>
              </div>
            </div>
            <Swords className="size-5 text-coral" />
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium">HP</span>
              <span className="text-muted">{monster.currentHp}/{monster.maxHp}</span>
            </div>
            <div className="h-3 bg-sunken rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-coral to-red-600 transition-all duration-300" style={{ width: `${monsterHpPct}%` }} />
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleBattle} disabled={challenge.willpower < 10}>
            <Swords className="size-4" /> Attack (-10 Willpower)
          </Button>
        </Card>
      )}

      {!monster && challenge.willpower >= 20 && (
        <Card className="mt-4 p-4">
          <div className="text-sm font-medium mb-2">Ready for battle?</div>
          <p className="text-xs text-muted mb-3">Use your willpower to fight metaphorical monsters. Defeating them earns XP equal to their max HP.</p>
          <Button variant="sun" className="w-full" onClick={handleBattle}>
            <Shield className="size-4" /> Spawn Monster (-20 Willpower)
          </Button>
        </Card>
      )}

      {buddyProgress && (
        <Card className="mt-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Leaderboard</h2>
            <TrendingUp className="size-4 text-mint" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-sunken rounded-xl">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-mint/20 flex items-center justify-center text-xs font-bold">{account.displayName[0]}</div>
                <div>
                  <div className="font-medium text-sm">{account.displayName}</div>
                  <div className="text-xs text-muted">{challenge.currentStreak} day streak</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-mint">{challenge.xp}</div>
                <div className="text-xs text-muted">XP</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-sunken rounded-xl">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-sky/20 flex items-center justify-center text-xs font-bold">{buddyProgress.displayName[0]}</div>
                <div>
                  <div className="font-medium text-sm">{buddyProgress.displayName}</div>
                  <div className="text-xs text-muted">{buddyProgress.challenge.currentStreak} day streak</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-sky">{buddyProgress.challenge.xp}</div>
                <div className="text-xs text-muted">XP</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {challenge.buddyEmail && !buddyProgress && (
        <Card className="mt-4 p-4">
          <div className="text-sm"><span className="text-muted">Buddy:</span> {challenge.buddyEmail}</div>
          <p className="text-xs text-muted mt-1">Waiting for them to start their challenge...</p>
        </Card>
      )}
    </main>
  );
}
