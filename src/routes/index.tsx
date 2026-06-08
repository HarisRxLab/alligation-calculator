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
  const [cHigh, setCHigh] = useState("70");
  const [cLow, setCLow] = useState("20");
  const [cDesired, setCDesired] = useState("40");
  const [volume, setVolume] = useState("500");

  const result = useMemo(() => {
    const high = parseFloat(cHigh);
    const low = parseFloat(cLow);
    const desired = parseFloat(cDesired);
    const vol = parseFloat(volume);
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

  const diagram = useMemo(() => {
    const high = parseFloat(cHigh);
    const low = parseFloat(cLow);
    const desired = parseFloat(cDesired);
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
    <div className="min-h-screen bg-[oklch(0.97_0.01_60)] flex items-start justify-center pt-10 px-4 font-serif">
      <div className="w-full max-w-xl">
        {/* Top tape strip */}
        <div className="h-3 bg-[oklch(0.88_0.04_80)] rounded-t-sm mb-0 opacity-60" />

        {/* Header */}
        <div className="bg-white border border-[oklch(0.88_0.03_60)] rounded-b-sm shadow-sm px-8 pt-6 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[oklch(0.2_0.02_60)] mb-6">
            Alligation Calculator
          </h1>

          {/* Inputs */}
          <div className="space-y-3 mb-6">
            <Field
              label="Solution A — Higher %"
              value={cHigh}
              onChange={setCHigh}
              placeholder="e.g. 70"
              suffix="%"
            />
            <Field
              label="Solution B — Lower %"
              value={cLow}
              onChange={setCLow}
              placeholder="e.g. 20"
              suffix="%"
            />
            <Field
              label="Desired concentration"
              value={cDesired}
              onChange={setCDesired}
              placeholder="e.g. 40"
              suffix="%"
            />
            <Field
              label="Total volume"
              value={volume}
              onChange={setVolume}
              placeholder="e.g. 500"
              suffix="mL"
            />
          </div>

          {/* Diagram */}
          <p className="text-xs uppercase tracking-widest text-[oklch(0.6_0.02_60)] mb-2">
            Alligation diagram
          </p>
          <AlligationDiagram d={diagram} />

          {/* Result */}
          <div className="mt-6 border-t border-[oklch(0.88_0.03_60)] pt-4">
            <p className="text-xs uppercase tracking-widest text-[oklch(0.6_0.02_60)] mb-3">
              Measure
            </p>
            {!result && (
              <p className="text-sm italic text-[oklch(0.65_0.02_60)]">
                Fill all four fields above to see the mixture.
              </p>
            )}
            {result && "error" in result && (
              <p className="text-sm text-red-600 font-semibold">{result.error}</p>
            )}
            {result && !("error" in result) && (
              <div className="space-y-2">
                <MeasureRow
                  label="Solution A"
                  sub={`${fmt(result.hi, 2)}%`}
                  value={fmt(result.volHigh, 2)}
                  unit="mL"
                />
                <MeasureRow
                  label="Solution B"
                  sub={`${fmt(result.lo, 2)}%`}
                  value={fmt(result.volLow, 2)}
                  unit="mL"
                />
                <div className="flex items-baseline gap-2 pt-1 text-sm text-[oklch(0.45_0.02_60)]">
                  <span className="font-semibold">Ratio A : B</span>
                  <span className="mx-1 text-[oklch(0.7_0.02_60)]">&#8203;</span>
                  <span>
                    {fmt(result.partsHigh, 2)} : {fmt(result.partsLow, 2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={clearAll}
              className="text-xs text-[oklch(0.55_0.02_60)] underline underline-offset-2 hover:text-[oklch(0.3_0.02_60)] transition-colors"
            >
              Clear worksheet
            </button>
            <p className="text-xs text-[oklch(0.7_0.02_60)] italic">
              Haris Mohamed K M
            </p>
          </div>
          <p className="mt-4 text-[10px] text-[oklch(0.72_0.015_60)] leading-relaxed">
            For educational and calculation support only. Does not replace
            institutional policies or independent clinical judgment.
          </p>
        </div>
      </div>
    </div>
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
    <div className="flex flex-col gap-0.5">
      <label className="text-xs uppercase tracking-widest text-[oklch(0.55_0.02_60)]">
        {label}
      </label>
      <div className="flex items-center border-b border-[oklch(0.82_0.025_60)] pb-1 gap-2">
        <input
          inputMode="decimal"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none py-1.5 text-lg font-serif text-[oklch(0.2_0.02_60)] placeholder:text-[oklch(0.75_0.015_60)] placeholder:italic tabular-nums"
        />
        {suffix && (
          <span className="text-sm text-[oklch(0.6_0.02_60)]">{suffix}</span>
        )}
      </div>
    </div>
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
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-[oklch(0.35_0.02_60)] font-semibold">
        {label} <span className="font-normal text-[oklch(0.6_0.02_60)]">· {sub}</span>
      </span>
      <span className="tabular-nums text-[oklch(0.2_0.02_60)] font-bold">
        {value} <span className="font-normal text-[oklch(0.6_0.02_60)]">{unit}</span>
      </span>
    </div>
  );
}

function AlligationDiagram({
  d,
}: {
  d: {
    hi: number;
    lo: number;
    desired: number;
    partsHigh: number;
    partsLow: number;
    valid: boolean;
  } | null;
}) {
  const W = 360;
  const H = 200;
  const ink = "oklch(0.3 0.02 60)";
  const faint = "oklch(0.78 0.015 60)";
  const accent = "oklch(0.45 0.08 25)";

  const cells = {
    tl: { x: 60,  y: 50,  label: "Higher %",  value: d ? fmt(d.hi, 2) : "—" },
    bl: { x: 60,  y: 150, label: "Lower %",   value: d ? fmt(d.lo, 2) : "—" },
    c:  { x: 180, y: 100, label: "Desired",    value: d ? fmt(d.desired, 2) : "—" },
    tr: { x: 300, y: 50,  label: "Parts of A", value: d && d.valid ? fmt(d.partsHigh, 2) : "—" },
    br: { x: 300, y: 150, label: "Parts of B", value: d && d.valid ? fmt(d.partsLow, 2) : "—" },
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-sm mx-auto"
        aria-label="Alligation diagram"
      >
        {/* Diagonal lines */}
        <line x1={cells.tl.x} y1={cells.tl.y} x2={cells.c.x} y2={cells.c.y} stroke={faint} strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1={cells.bl.x} y1={cells.bl.y} x2={cells.c.x} y2={cells.c.y} stroke={faint} strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1={cells.c.x}  y1={cells.c.y}  x2={cells.tr.x} y2={cells.tr.y} stroke={faint} strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1={cells.c.x}  y1={cells.c.y}  x2={cells.br.x} y2={cells.br.y} stroke={faint} strokeWidth="1.5" strokeDasharray="4 3" />

        {/* Nodes */}
        {Object.entries(cells).map(([key, c]) => (
          <g key={key} transform={`translate(${c.x},${c.y})`}>
            <circle r="32" fill="oklch(0.97 0.01 60)" stroke={ink} strokeWidth="1.2" />
            <text
              textAnchor="middle"
              dy="-4"
              fontSize="11"
              fontFamily="serif"
              fill={ink}
              fontWeight="600"
            >
              {c.value}
            </text>
            <text
              textAnchor="middle"
              dy="12"
              fontSize="7"
              fontFamily="sans-serif"
              fill={faint}
              letterSpacing="1"
            >
              {c.label.toUpperCase()}
            </text>
          </g>
        ))}

        {d && !d.valid && (
          <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="8" fill={accent}>
            Desired must lie between the two concentrations.
          </text>
        )}
      </svg>
    </div>
  );
}
