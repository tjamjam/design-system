// Mock data for the playground charts.
// Numbers hand-tuned to look realistic, not random.

export type ThroughputPoint = {
  hour: string;
  "us-east-1": number;
  "us-west-2": number;
  "eu-central-1": number;
  "ap-south-1": number;
};

export const throughputByRegion: ThroughputPoint[] = [
  { hour: "00:00", "us-east-1": 8200, "us-west-2": 1400, "eu-central-1": 3200, "ap-south-1": 450 },
  { hour: "01:00", "us-east-1": 7900, "us-west-2": 1300, "eu-central-1": 3100, "ap-south-1": 420 },
  { hour: "02:00", "us-east-1": 7400, "us-west-2": 1200, "eu-central-1": 3400, "ap-south-1": 510 },
  { hour: "03:00", "us-east-1": 7100, "us-west-2": 1150, "eu-central-1": 3600, "ap-south-1": 580 },
  { hour: "04:00", "us-east-1": 6800, "us-west-2": 1100, "eu-central-1": 3800, "ap-south-1": 640 },
  { hour: "05:00", "us-east-1": 7200, "us-west-2": 1180, "eu-central-1": 4100, "ap-south-1": 720 },
  { hour: "06:00", "us-east-1": 8100, "us-west-2": 1350, "eu-central-1": 4400, "ap-south-1": 810 },
  { hour: "07:00", "us-east-1": 9400, "us-west-2": 1620, "eu-central-1": 4700, "ap-south-1": 880 },
  { hour: "08:00", "us-east-1": 11200, "us-west-2": 2100, "eu-central-1": 4900, "ap-south-1": 920 },
  { hour: "09:00", "us-east-1": 12800, "us-west-2": 2650, "eu-central-1": 5100, "ap-south-1": 1020 },
  { hour: "10:00", "us-east-1": 13400, "us-west-2": 3200, "eu-central-1": 5250, "ap-south-1": 1080 },
  { hour: "11:00", "us-east-1": 13900, "us-west-2": 3650, "eu-central-1": 5300, "ap-south-1": 1100 },
  { hour: "12:00", "us-east-1": 14100, "us-west-2": 4100, "eu-central-1": 5150, "ap-south-1": 1040 },
  { hour: "13:00", "us-east-1": 14500, "us-west-2": 4400, "eu-central-1": 4950, "ap-south-1": 980 },
  { hour: "14:00", "us-east-1": 15100, "us-west-2": 4650, "eu-central-1": 4700, "ap-south-1": 920 },
  { hour: "15:00", "us-east-1": 15600, "us-west-2": 4850, "eu-central-1": 4400, "ap-south-1": 860 },
  { hour: "16:00", "us-east-1": 15200, "us-west-2": 4700, "eu-central-1": 4100, "ap-south-1": 780 },
  { hour: "17:00", "us-east-1": 14400, "us-west-2": 4350, "eu-central-1": 3800, "ap-south-1": 700 },
  { hour: "18:00", "us-east-1": 13500, "us-west-2": 3900, "eu-central-1": 3600, "ap-south-1": 640 },
  { hour: "19:00", "us-east-1": 12100, "us-west-2": 3400, "eu-central-1": 3450, "ap-south-1": 590 },
  { hour: "20:00", "us-east-1": 10800, "us-west-2": 2800, "eu-central-1": 3350, "ap-south-1": 540 },
  { hour: "21:00", "us-east-1": 9800, "us-west-2": 2300, "eu-central-1": 3250, "ap-south-1": 500 },
  { hour: "22:00", "us-east-1": 9100, "us-west-2": 1950, "eu-central-1": 3200, "ap-south-1": 470 },
  { hour: "23:00", "us-east-1": 8600, "us-west-2": 1650, "eu-central-1": 3180, "ap-south-1": 455 },
];

export type StatusCount = { status: string; count: number };

export const runsByStatus: StatusCount[] = [
  { status: "active", count: 142 },
  { status: "paused", count: 9 },
  { status: "failed", count: 6 },
  { status: "draft", count: 3 },
];

export const statSparks: Record<
  "throughput" | "errorRate" | "active" | "failed",
  number[]
> = {
  // Gentle climb to the current p50, small dip midday
  throughput: [
    18.2, 18.1, 17.8, 17.4, 17.6, 18.5, 19.8, 21.4, 22.1, 22.8, 23.1, 23.4,
    23.2, 22.9, 22.4, 22.6, 23.0, 23.5, 23.8, 23.6, 23.4, 23.5, 23.4, 23.4,
  ],
  // Wobbly, hovering around 0.42 with a brief spike then recovery
  errorRate: [
    0.38, 0.36, 0.41, 0.45, 0.44, 0.42, 0.40, 0.39, 0.41, 0.48, 0.56, 0.62,
    0.58, 0.52, 0.48, 0.46, 0.44, 0.43, 0.42, 0.42, 0.42, 0.42, 0.42, 0.42,
  ],
  // Steady pipeline count with a small uptick
  active: [
    45, 45, 45, 44, 44, 45, 45, 46, 46, 46, 47, 47, 47, 47, 47, 48, 48, 48, 48,
    48, 48, 48, 48, 48,
  ],
  // Spiky: recent bump in failures
  failed: [
    4, 3, 4, 5, 4, 3, 3, 4, 4, 3, 4, 5, 6, 7, 9, 11, 10, 8, 9, 9, 9, 9, 9, 9,
  ],
};
