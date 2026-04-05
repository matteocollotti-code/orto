import { cn } from "@/lib/utils";
import type { PlantProfile, SpeciesKey } from "@/lib/orto-types";

type PlantIllustrationProps = {
  speciesKey: SpeciesKey;
  tone: PlantProfile["illustrationTone"];
  className?: string;
};

export function PlantIllustration({
  speciesKey,
  tone,
  className,
}: PlantIllustrationProps) {
  return (
    <svg
      viewBox="0 0 220 180"
      role="img"
      aria-label={`Illustrazione ${speciesKey}`}
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id={`pot-${speciesKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tone.pot} />
          <stop offset="100%" stopColor="#f7f0e6" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="152" rx="72" ry="15" fill="rgba(38,79,49,0.08)" />
      {renderPlant(speciesKey, tone)}
      <path
        d="M66 110h88l-10 40c-1.8 6.8-7.9 11.6-14.9 11.6H91c-7 0-13.1-4.8-14.9-11.6z"
        fill={`url(#pot-${speciesKey})`}
      />
      <path
        d="M62 105c0-5.5 4.5-10 10-10h76c5.5 0 10 4.5 10 10v8H62z"
        fill="#efe5d7"
        opacity="0.95"
      />
    </svg>
  );
}

function renderPlant(speciesKey: SpeciesKey, tone: PlantProfile["illustrationTone"]) {
  switch (speciesKey) {
    case "basilico":
      return (
        <>
          <path d="M109 106V64" stroke="#6e5746" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M88 104V72" stroke="#6e5746" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M130 104V72" stroke="#6e5746" strokeWidth="2.6" strokeLinecap="round" />
          {[
            [108, 64, 24, 14, -18],
            [95, 73, 22, 13, 24],
            [121, 73, 22, 13, -24],
            [86, 78, 20, 12, -26],
            [132, 81, 20, 12, 26],
            [107, 82, 23, 12, 12],
            [95, 92, 20, 11, -16],
            [122, 92, 20, 11, 16],
          ].map(([cx, cy, rx, ry, rotate], index) => (
            <ellipse
              key={`${speciesKey}-${index}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={index % 2 === 0 ? tone.leaf : tone.accent}
              transform={`rotate(${rotate} ${cx} ${cy})`}
            />
          ))}
        </>
      );
    case "limone":
      return (
        <>
          <path d="M110 102V42" stroke="#765b45" strokeWidth="4" strokeLinecap="round" />
          <path d="M110 62c18-4 30-18 35-36" stroke="#765b45" strokeWidth="3" fill="none" />
          <path d="M110 70c-16-8-27-24-30-41" stroke="#765b45" strokeWidth="3" fill="none" />
          <path d="M110 80c22 0 38 9 50 23" stroke="#765b45" strokeWidth="3" fill="none" />
          <path d="M110 85c-20 3-34 11-45 24" stroke="#765b45" strokeWidth="3" fill="none" />
          {[
            [80, 40, -28],
            [96, 53, 8],
            [133, 47, 26],
            [148, 75, 18],
            [73, 74, -18],
            [126, 83, -10],
            [92, 89, 22],
          ].map(([cx, cy, rotate], index) => (
            <ellipse
              key={`${speciesKey}-leaf-${index}`}
              cx={cx}
              cy={cy}
              rx="15"
              ry="8"
              fill={tone.leaf}
              transform={`rotate(${rotate} ${cx} ${cy})`}
            />
          ))}
          <circle cx="136" cy="62" r="8" fill={tone.accent} />
          <circle cx="90" cy="69" r="7" fill={tone.accent} />
          <circle cx="119" cy="88" r="6.5" fill={tone.accent} />
        </>
      );
    case "salvia":
      return (
        <>
          <path d="M110 104V56" stroke="#7c6a58" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M96 105V64" stroke="#7c6a58" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M123 105V64" stroke="#7c6a58" strokeWidth="2.5" strokeLinecap="round" />
          {[
            [90, 69, 19, 10, -28],
            [104, 58, 21, 12, -12],
            [120, 58, 21, 12, 12],
            [130, 70, 18, 10, 28],
            [97, 83, 20, 11, -18],
            [123, 84, 20, 11, 18],
          ].map(([cx, cy, rx, ry, rotate], index) => (
            <ellipse
              key={`${speciesKey}-${index}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={index % 2 === 0 ? tone.leaf : tone.accent}
              opacity="0.95"
              transform={`rotate(${rotate} ${cx} ${cy})`}
            />
          ))}
        </>
      );
    case "rosmarino":
      return (
        <>
          {[82, 98, 110, 124, 138].map((x, index) => (
            <path
              key={`${speciesKey}-branch-${x}`}
              d={`M${x} 104V${48 + index * 4}`}
              stroke="#6d5847"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ))}
          {Array.from({ length: 24 }).map((_, index) => {
            const column = index % 5;
            const row = Math.floor(index / 5);
            const x = 82 + column * 14 + (row % 2 ? 4 : 0);
            const y = 52 + row * 12;
            const rotate = row % 2 ? 26 : -26;

            return (
              <rect
                key={`${speciesKey}-needle-${index}`}
                x={x}
                y={y}
                width="3"
                height="13"
                rx="2"
                fill={index % 2 ? tone.accent : tone.leaf}
                transform={`rotate(${rotate} ${x} ${y})`}
              />
            );
          })}
        </>
      );
    case "gelsomino":
      return (
        <>
          <path
            d="M82 105c3-21 12-36 28-49 11-10 22-16 41-19"
            stroke="#6b5548"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M111 104c-1-19 6-34 18-47 10-10 19-17 31-21"
            stroke="#6b5548"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />
          {[
            [88, 70, -24],
            [108, 58, 8],
            [128, 54, 18],
            [146, 70, 22],
            [116, 78, -16],
            [96, 86, 14],
            [136, 86, -12],
          ].map(([cx, cy, rotate], index) => (
            <ellipse
              key={`${speciesKey}-leaf-${index}`}
              cx={cx}
              cy={cy}
              rx="15"
              ry="8"
              fill={tone.leaf}
              transform={`rotate(${rotate} ${cx} ${cy})`}
            />
          ))}
          {[
            [101, 61],
            [138, 62],
            [119, 84],
          ].map(([cx, cy], index) => (
            <g key={`${speciesKey}-flower-${index}`}>
              <circle cx={cx} cy={cy} r="3.4" fill="#f7d56c" />
              {[0, 72, 144, 216, 288].map((rotate) => (
                <ellipse
                  key={`${speciesKey}-petal-${index}-${rotate}`}
                  cx={cx}
                  cy={cy - 7}
                  rx="4"
                  ry="7"
                  fill={tone.bloom ?? "#fff"}
                  transform={`rotate(${rotate} ${cx} ${cy})`}
                />
              ))}
            </g>
          ))}
        </>
      );
    case "pothos":
      return (
        <>
          <path
            d="M112 102c0-20 2-33 7-45 6-14 16-24 31-33"
            stroke="#75604d"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M103 105c-3-15-11-28-24-37-10-7-20-10-29-11"
            stroke="#75604d"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {[
            [76, 60, -16],
            [90, 82, 12],
            [124, 75, -14],
            [145, 48, 24],
            [118, 56, 4],
          ].map(([cx, cy, rotate], index) => (
            <path
              key={`${speciesKey}-${index}`}
              d={`M${cx} ${cy}c8-13 24-13 30 0-2 14-11 21-15 27-4-6-13-13-15-27z`}
              fill={index % 2 ? tone.accent : tone.leaf}
              transform={`rotate(${rotate} ${cx + 15} ${cy + 14})`}
            />
          ))}
        </>
      );
    case "caffe":
      return (
        <>
          <path d="M110 103V47" stroke="#6f5a47" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M110 66c-16-8-26-18-31-33" stroke="#6f5a47" strokeWidth="2.8" fill="none" />
          <path d="M110 70c19-7 28-18 33-34" stroke="#6f5a47" strokeWidth="2.8" fill="none" />
          <path d="M110 82c-20 2-31 11-39 25" stroke="#6f5a47" strokeWidth="2.8" fill="none" />
          <path d="M110 86c22 2 31 12 37 23" stroke="#6f5a47" strokeWidth="2.8" fill="none" />
          {[
            [84, 40, -28],
            [96, 58, 12],
            [133, 42, 28],
            [124, 60, -10],
            [88, 88, -22],
            [132, 92, 22],
          ].map(([cx, cy, rotate], index) => (
            <ellipse
              key={`${speciesKey}-${index}`}
              cx={cx}
              cy={cy}
              rx="17"
              ry="9"
              fill={tone.leaf}
              transform={`rotate(${rotate} ${cx} ${cy})`}
            />
          ))}
          <circle cx="102" cy="74" r="4" fill={tone.accent} />
          <circle cx="118" cy="73" r="4" fill={tone.accent} />
          <circle cx="112" cy="91" r="4" fill={tone.accent} />
        </>
      );
    case "monstera":
      return (
        <>
          <path d="M90 104V65" stroke="#705b47" strokeWidth="3" strokeLinecap="round" />
          <path d="M129 104V58" stroke="#705b47" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M73 68c24-31 63-18 68 10-5 25-26 34-40 39-12-8-32-22-28-49z"
            fill={tone.leaf}
          />
          <path
            d="M109 60c23-29 56-15 60 12-4 23-21 33-34 37-11-7-29-20-26-49z"
            fill={tone.accent}
          />
          {[
            [96, 78],
            [110, 82],
            [126, 76],
            [141, 82],
            [88, 92],
            [136, 93],
          ].map(([cx, cy], index) => (
            <ellipse
              key={`${speciesKey}-${index}`}
              cx={cx}
              cy={cy}
              rx="4"
              ry="8"
              fill="#f5f1e7"
              transform={`rotate(${index % 2 ? 18 : -18} ${cx} ${cy})`}
            />
          ))}
        </>
      );
    case "avocado":
      return (
        <>
          <path d="M110 104V46" stroke="#705742" strokeWidth="4" strokeLinecap="round" />
          {[
            [90, 48, -28],
            [128, 47, 26],
            [84, 70, -18],
            [135, 72, 20],
            [102, 58, -4],
            [121, 58, 10],
            [110, 83, 0],
          ].map(([cx, cy, rotate], index) => (
            <ellipse
              key={`${speciesKey}-${index}`}
              cx={cx}
              cy={cy}
              rx="18"
              ry="10"
              fill={index % 2 ? tone.accent : tone.leaf}
              transform={`rotate(${rotate} ${cx} ${cy})`}
            />
          ))}
        </>
      );
    case "pothos-acqua":
      return (
        <>
          <path d="M110 105V72" stroke="#6c5647" strokeWidth="2.6" strokeLinecap="round" />
          <path
            d="M110 75c11-17 26-27 44-31"
            stroke="#6c5647"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M110 80c-10-14-24-23-40-27"
            stroke="#6c5647"
            strokeWidth="2.6"
            fill="none"
            strokeLinecap="round"
          />
          {[
            [80, 55, -14],
            [101, 64, 4],
            [129, 61, -8],
            [149, 45, 20],
          ].map(([cx, cy, rotate], index) => (
            <path
              key={`${speciesKey}-leaf-${index}`}
              d={`M${cx} ${cy}c7-12 22-12 28 0-2 13-10 20-14 25-4-5-12-12-14-25z`}
              fill={index % 2 ? tone.accent : tone.leaf}
              transform={`rotate(${rotate} ${cx + 14} ${cy + 12})`}
            />
          ))}
          <path
            d="M92 98h36l6 34c1 5.5-3.3 10.5-8.9 10.5H99c-5.6 0-9.9-5-8.9-10.5z"
            fill="#dbf4f7"
            opacity="0.75"
          />
          <path
            d="M92 98h36l2 17H90z"
            fill="#c3edf3"
            opacity="0.88"
          />
          <path
            d="M102 104c1 10-1 18-5 24"
            stroke="#8a7b67"
            strokeWidth="2"
            fill="none"
            opacity="0.65"
          />
          <path
            d="M113 104c0 10 2 20 6 27"
            stroke="#8a7b67"
            strokeWidth="2"
            fill="none"
            opacity="0.65"
          />
        </>
      );
    case "custom":
    default:
      return (
        <>
          <path d="M110 104V55" stroke="#6e5847" strokeWidth="3.2" strokeLinecap="round" />
          {[80, 96, 124, 140].map((cx, index) => (
            <ellipse
              key={`${speciesKey}-${index}`}
              cx={cx}
              cy={index < 2 ? 72 : 58}
              rx="16"
              ry="10"
              fill={index % 2 ? tone.accent : tone.leaf}
              transform={`rotate(${index % 2 ? 22 : -22} ${cx} ${index < 2 ? 72 : 58})`}
            />
          ))}
        </>
      );
  }
}
