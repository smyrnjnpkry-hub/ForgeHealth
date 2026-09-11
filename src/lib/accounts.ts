export const DEMO_ACCOUNTS = [
  {
    id: "soumya",
    email: "smyrnjnpkry@gmail.com",
    displayName: "Soumya",
  },
  {
    id: "sutapa",
    email: "sutapanahak23@gmail.com",
    displayName: "Sutapa",
  },
] as const;

export type DemoAccountId = (typeof DEMO_ACCOUNTS)[number]["id"];

export function buddyIdFor(accountId: string) {
  return accountId === "soumya" ? "sutapa" : "soumya";
}

export function buddyStorageKey(accountId: string) {
  return `forgehealth-buddy-${buddyIdFor(accountId)}`;
}

export function ownBuddySnapshotKey(accountId: string) {
  return `forgehealth-buddy-${accountId}`;
}
