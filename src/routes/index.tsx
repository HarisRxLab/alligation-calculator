import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alligation Calculator — Pharmacist's Worksheet" },
      {
        name: "description",
        content:
          "A pharmacist's worksheet-style alligation calculator with a live tic-tac-toe diagram for mixing two solutions to a target concentration.",
      },
    ],
  }),
  component: Index,
});

const fmt = (n: number | null | undefined, dp = 4) =>
  n === null || n === undefined || !Number.isFinite(n)
    ? "—"
    : Number(n).toLocaleString(undefined, { maximumFractionDigits: dp });

function Index() {
  const [cHigh, setCHigh] = useState("");
  const [cLow, setCLow] = useState("");
  const [cDesired, setCDesired] = useState("");
  const [volume, setVolume] = useState("");

  const parsed = {
    high: parseFloat(cHigh),
    low: parseFloat(cLow),
    desired: parseFloat(cDesired),
    vol: parseFloat(volume),
  };

  const result = useMemo(() => {
    const { high, low, desired, vol } = parsed;
    if (![high, low, desired, vol].every(Number.isFinite) || vol <= 0) return null;
    if (high === low) return { error: "Concentrations must differ." as const };
    const [hi, lo] = high > low ? [high, low] : [low, high];
    if (desired < lo || desired > hi)
      return { error: "Desired must be between the two concentrations." as const };
    const partsHigh = desired - lo;
    const partsLow = hi - desired;
    const total = partsHigh + partsLow;
    const volHigh = (vol * partsHigh) / total;
    return {
      volHigh,
      volLow: vol - volHigh,
      partsHigh,
      partsLow,
      hi,
      lo,
    };
  }, [cHigh, cLow, cDesired, volume]);

  // Diagram values (preview as you type; empty until both anchor concentrations + desired exist)
  const diagram = useMemo(() => {
    const { high, low, desired } = parsed;
    if (![high, low, desired].every(Number.isFinite)) return null;
    if (high === low) return null;
    const [hi, lo] = high > low ? [high, low] : [low, high];
    const partsHigh = desired - lo;
    const partsLow = hi - desired;
    const valid = desired >= lo && desired <= hi;
    return { hi, lo, desired, partsHigh, partsLow, valid };
  }, [cHigh, cLow, cDesired]);

  const clearAll = () => {
    setCHigh("");
    setCLow("");
    setCDesired("");
    setVolume("");
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:py-14 flex items-start sm:items-center justify-center bg-[oklch(0.985_0.004_85)]">
      <div className="w-full max-w-2xl">
        {/* Worksheet card */}
        <div className="relative bg-[oklch(0.995_0.003_85)] rounded-sm border border-[oklch(0.88_0.01_85)] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
          {/* Top tape strip */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-24 bg-[oklch(0.92_0.04_85/0.7)] rounded-[2px] rotate-[-1.5deg] shadow-sm" />

          <div className="px-5 sm:px-10 pt-8 sm:pt-10 pb-8">
            {/* Header */}
            <header className="border-b border-[oklch(0.85_0.01_85)] pb-5 mb-7">
              <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-[oklch(0.22_0.02_60)]">
                Alligation Calculator
              </h1>
            </header>

            {/* Inputs */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Solution A — Higher %" value={cHigh} onChange={setCHigh} placeholder="70" suffix="%" />
              <Field label="Solution B — Lower %" value={cLow} onChange={setCLow} placeholder="20" suffix="%" />
              <Field label="Desired concentration" value={cDesired} onChange={setCDesired} placeholder="40" suffix="%" />
              <Field label="Total volume" value={volume} onChange={setVolume} placeholder="500" suffix="mL" />
            </section>

            {/* Diagram */}
            <section className="mt-8">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.5_0.04_60)] font-semibold mb-3">
                Alligation diagram
              </p>
              <AlligationDiagram d={diagram} />
            </section>

            {/* Result */}
            <section
              aria-live="polite"
              className="mt-8 border-t border-dashed border-[oklch(0.82_0.01_85)] pt-6"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-[oklch(0.5_0.04_60)] font-semibold mb-4">
                Measure
              </p>

              {!result && (
                <p className="text-sm text-[oklch(0.5_0.02_60)] italic font-serif">
                  Fill all four fields above to see the mixture.
                </p>
              )}
              {result && "error" in result && (
                <p className="text-sm text-destructive font-medium">{result.error}</p>
              )}
              {result && !("error" in result) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MeasureRow
                    label="Solution A"
                    sub={`${fmt(result.hi, 4)} %`}
                    value={fmt(result.volHigh, 2)}
                    unit="mL"
                  />
                  <MeasureRow
                    label="Solution B"
                    sub={`${fmt(result.lo, 4)} %`}
                    value={fmt(result.volLow, 2)}
                    unit="mL"
                  />
                  <div className="sm:col-span-2 flex items-baseline justify-between pt-3 border-t border-dotted border-[oklch(0.85_0.01_85)]">
                    <span className="text-xs uppercase tracking-wider text-[oklch(0.5_0.02_60)]">
                      Ratio A : B
                    </span>
                    <span className="font-mono text-sm text-[oklch(0.3_0.02_60)] tabular-nums">
                      {fmt(result.partsHigh, 2)} : {fmt(result.partsLow, 2)}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={clearAll}
                className="text-xs uppercase tracking-wider font-semibold text-[oklch(0.4_0.02_60)] hover:text-[oklch(0.22_0.02_60)] transition-colors underline-offset-4 hover:underline"
              >
                Clear worksheet
              </button>
              <p className="text-[10px] text-[oklch(0.55_0.02_60)] font-serif italic max-w-xs text-right">
                For educational and calculation support only. Does not replace institutional policies
                or independent clinical judgment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[oklch(0.5_0.04_60)] font-semibold">
        {label}
      </span>
      <div className="flex items-baseline border-b border-[oklch(0.7_0.02_60)] focus-within:border-[oklch(0.35_0.04_60)] transition-colors">
        <input
          inputMode="decimal"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none py-1.5 text-lg font-serif text-[oklch(0.2_0.02_60)] placeholder:text-[oklch(0.75_0.015_60)] placeholder:italic tabular-nums"
        />
        {suffix && (
          <span className="ml-2 text-sm font-mono text-[oklch(0.5_0.02_60)]">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function MeasureRow({
  label,
  sub,
  value,
  unit,
}: {
  label: string;
  sub: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[oklch(0.5_0.04_60)] font-semibold">
        {label} <span className="text-[oklch(0.6_0.02_60)] font-normal normal-case tracking-normal">· {sub}</span>
      </span>
      <span className="mt-1 font-serif text-3xl text-[oklch(0.2_0.02_60)] tabular-nums">
        {value}
        <span className="ml-1.5 text-base text-[oklch(0.5_0.02_60)] font-mono">{unit}</span>
      </span>
    </div>
  );
}

function AlligationDiagram({
  d,
}: {
  d: { hi: number; lo: number; desired: number; partsHigh: number; partsLow: number; valid: boolean } | null;
}) {
  // SVG layout
  const W = 360;
  const H = 200;
  const ink = "oklch(0.3 0.02 60)";
  const faint = "oklch(0.78 0.015 60)";
  const accent = "oklch(0.45 0.08 25)";

  const cells = {
    tl: { x: 60, y: 50, label: "Higher %", value: d ? fmt(d.hi, 2) : "—" },
    bl: { x: 60, y: 150, label: "Lower %", value: d ? fmt(d.lo, 2) : "—" },
    c:  { x: 180, y: 100, label: "Desired", value: d ? fmt(d.desired, 2) : "—" },
    tr: { x: 300, y: 50, label: "Parts of A", value: d && d.valid ? fmt(d.partsHigh, 2) : "—" },
    br: { x: 300, y: 150, label: "Parts of B", value: d && d.valid ? fmt(d.partsLow, 2) : "—" },
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-md mx-auto block"
        role="img"
        aria-label="Alligation tic-tac-toe diagram"
      >
        {/* Diagonal lines */}
        <line x1={cells.tl.x} y1={cells.tl.y} x2={cells.br.x} y2={cells.br.y}
              stroke={d?.valid ? accent : faint} strokeWidth={1.2} strokeDasharray={d?.valid ? "0" : "3 3"} />
        <line x1={cells.bl.x} y1={cells.bl.y} x2={cells.tr.x} y2={cells.tr.y}
              stroke={d?.valid ? accent : faint} strokeWidth={1.2} strokeDasharray={d?.valid ? "0" : "3 3"} />

        {/* Nodes */}
        {Object.entries(cells).map(([key, c]) => (
          <g key={key}>
            <circle cx={c.x} cy={c.y} r={28} fill="oklch(0.995 0.003 85)" stroke={ink} strokeWidth={1} />
            <text
              x={c.x}
              y={c.y - 2}
              textAnchor="middle"
              fontFamily="ui-serif, Georgia, serif"
              fontSize={14}
              fill={ink}
              className="tabular-nums"
            >
              {c.value}
            </text>
            <text
              x={c.x}
              y={c.y + 11}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize={7}
              fill="oklch(0.5 0.02 60)"
              letterSpacing={0.6}
            >
              {c.label.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
      {d && !d.valid && (
        <p className="mt-2 text-center text-xs text-destructive">
          Desired must lie between the two concentrations.
        </p>
      )}
    </div>
  );
}
