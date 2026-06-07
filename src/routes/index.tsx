import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alligation Calculator — Simple Dilution Math" },
      {
        name: "description",
        content:
          "A clean, macOS-inspired alligation calculator for mixing two solutions to reach a desired concentration and volume.",
      },
    ],
  }),
  component: Index,
});

const fmt = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "—";

function Index() {
  const [cHigh, setCHigh] = useState("");
  const [cLow, setCLow] = useState("");
  const [cDesired, setCDesired] = useState("");
  const [volume, setVolume] = useState("");

  const result = useMemo(() => {
    const high = parseFloat(cHigh);
    const low = parseFloat(cLow);
    const desired = parseFloat(cDesired);
    const vol = parseFloat(volume);
    if (![high, low, desired, vol].every(Number.isFinite) || vol <= 0) return null;
    if (high === low) return { error: "Concentrations must differ." };
    const [hi, lo] = high > low ? [high, low] : [low, high];
    if (desired < lo || desired > hi)
      return { error: "Desired must be between the two concentrations." };
    const partsHigh = desired - lo;
    const partsLow = hi - desired;
    const total = partsHigh + partsLow;
    const volHigh = (vol * partsHigh) / total;
    return {
      volHigh,
      volLow: vol - volHigh,
      ratioHigh: partsHigh,
      ratioLow: partsLow,
      strongerIsA: high >= low,
    };
  }, [cHigh, cLow, cDesired, volume]);

  const clearAll = () => {
    setCHigh("");
    setCLow("");
    setCDesired("");
    setVolume("");
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:py-14 flex items-start sm:items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="mac-panel rounded-2xl overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[oklch(0.9_0.008_250)] bg-gradient-to-b from-[oklch(0.985_0.003_250)] to-[oklch(0.96_0.008_250)]">
            <span className="traffic-light bg-[oklch(0.7_0.18_25)]" />
            <span className="traffic-light bg-[oklch(0.82_0.15_85)]" />
            <span className="traffic-light bg-[oklch(0.75_0.18_145)]" />
            <div className="flex-1 text-center text-xs font-medium text-[oklch(0.45_0.02_260)] tracking-tight">
              Alligation Calculator
            </div>
            <div className="w-12" />
          </div>

          {/* Body */}
          <div className="p-5 sm:p-7">
            <header className="mb-6 text-center">
              <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-[oklch(0.2_0.03_260)]">
                Dilution made simple
              </h1>
              <p className="mt-1.5 text-sm text-[oklch(0.5_0.02_260)]">
                Mix two solutions to a target concentration and total volume.
              </p>
            </header>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <KeyField label="Solution A" suffix="%" value={cHigh} onChange={setCHigh} placeholder="70" />
                <KeyField label="Solution B" suffix="%" value={cLow} onChange={setCLow} placeholder="20" />
              </div>

              <KeyField label="Desired concentration" suffix="%" value={cDesired} onChange={setCDesired} placeholder="40" />

              <KeyField label="Total volume" suffix="mL" value={volume} onChange={setVolume} placeholder="500" />
            </div>

            {/* Result */}
            <div
              aria-live="polite"
              className="mt-6 rounded-xl border border-[oklch(0.9_0.008_250)] bg-gradient-to-b from-[oklch(0.99_0.003_250)] to-[oklch(0.965_0.008_250)] p-5 shadow-[0_1px_0_oklch(1_0_0)_inset]"
            >
              {!result && (
                <p className="text-sm text-[oklch(0.5_0.02_260)] text-center">
                  Enter values to see the mixture.
                </p>
              )}
              {result && "error" in result && (
                <p className="text-sm text-destructive text-center">{result.error}</p>
              )}
              {result && !("error" in result) && (
                <div className="space-y-3.5">
                  <Row label="Solution A" value={`${fmt(result.volHigh)} mL`} />
                  <div className="h-px bg-[oklch(0.92_0.008_250)]" />
                  <Row label="Solution B" value={`${fmt(result.volLow)} mL`} />
                  <div className="h-px bg-[oklch(0.92_0.008_250)]" />
                  <Row
                    label="Ratio (A : B)"
                    value={`${fmt(result.ratioHigh)} : ${fmt(result.ratioLow)}`}
                    muted
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-center">
              <button onClick={clearAll} className="mac-key px-5 h-9 text-sm font-medium">
                Clear all
              </button>
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-[oklch(0.55_0.02_260)] text-center">
              For educational and calculation support only. Does not replace
              institutional policies or independent clinical judgment.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function KeyField({
  label, value, onChange, placeholder, suffix,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium uppercase tracking-wider text-[oklch(0.5_0.02_260)] px-1">
        {label}
      </label>
      <div className="mac-input flex items-center h-11 px-3">
        <input
          inputMode="decimal"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-base sm:text-[15px] font-medium text-[oklch(0.2_0.03_260)] placeholder:text-[oklch(0.7_0.015_260)] placeholder:font-normal tabular-nums"
        />
        {suffix && (
          <span className="ml-2 text-sm font-medium text-[oklch(0.55_0.02_260)]">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-[oklch(0.5_0.02_260)]">{label}</span>
      <span className={muted
        ? "text-sm font-semibold tabular-nums text-[oklch(0.35_0.02_260)]"
        : "text-lg font-semibold tabular-nums text-[oklch(0.2_0.03_260)]"}>
        {value}
      </span>
    </div>
  );
}
