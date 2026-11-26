export type OutreachResource = {
  id: string;
  title: string;
  description: string | null;
  meta: string;
  href: string | null;
  tone: string;
  thumbnailUrl: string | null;
  isVideo: boolean;
};

export type Testimony = {
  id: string;
  quote: string;
  name: string;
  role?: string | null;
  image?: string | null;
};

export type ProgressStat = {
  label: string;
  value: string;
  detail: string;
};
