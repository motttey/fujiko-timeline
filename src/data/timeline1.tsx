export type TimelineItem = {
  id: number;
  date: string;
  work: string;
  url: string;
};

export interface BackgroundImagePath {
  [key: string]: string;
}

export const backgroundImagePath: BackgroundImagePath = {
  "uBTpfEAU2cEZucx": "https://pbs.twimg.com/profile_images/1246044432006168577/-kA1KKDu_400x400.jpg"
}

// fix: sample data
export const timelineData: TimelineItem[] = [
  {
    id: 1,
    date: "1983-05-28",
    work: "大長編ドラえもん のび太の海底鬼岩城 (てんとう虫コミックス)",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1918816524514505130",
  },
  {
    id: 2,
    date: "1976-09-01",
    work: "みどりの守り神",
    url: "https://twitter.com/uBTpfEAU2cEZucx/status/1909901401742029056",
  },
];
