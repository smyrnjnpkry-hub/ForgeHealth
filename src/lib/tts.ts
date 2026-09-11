let unlocked = false;

export function unlockTts() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  unlocked = true;
  window.speechSynthesis.cancel();
}

export function speak(text: string, volume = 0.9) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!text.trim()) return;
  unlocked = true;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.02;
  u.pitch = 1;
  u.volume = Math.max(0, Math.min(1, volume));
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => /en-US|en_US/.test(v.lang) && /female|samantha|google us|natural/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en") && /google|samantha|zira|female/i.test(v.name)) ??
    voices.find((v) => v.lang.startsWith("en"));
  if (preferred) u.voice = preferred;
  window.speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export function ttsAvailable() {
  return typeof window !== "undefined" && "speechSynthesis" in window && unlocked;
}
