import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alligation Calculator — Simple Dilution Math" },
      {
        name: "description",
        content:
          "A simple, elegant alligation calculator for mixing two solutions to reach a desired concentration and volume.",
      },
      { property: "og:title", content: "Alligation Calculator" },
      {
        property: "og:description",
        content:
          "Mix two solutions to a target concentration. Clean, mobile-friendly dilution math.",
      },
    ],
  }),
  component: Index,
});

type VolumeUnit =
  | "mL"
  | "L"
  | "µL"
  | "cm³"
  | "m³"
  | "US gal"
  | "UK gal"
  | "US fl oz"
  | "UK fl oz";

const UNITS: VolumeUnit[] = [
  "mL",
  "L",
  "µL",
  "cm³",
  "m³",
  "US gal",
  "UK gal",
  "US fl oz",
  "UK fl oz",
];

const toMilliLiters = (value: number, unit: VolumeUnit): number => {
  switch (unit) {
    case "mL":
      return value;
    case "L":
      return value * 1000;
    case "µL":
      return value / 1000;
    case "cm³":
      return value;
    case "m³":
      return value * 1_000_000;
    case "US gal":
      return value * 3785.411784;
    case "UK gal":
      return value * 4546.09;
    case "US fl oz":
      return value * 29.5735295625;
    case "UK fl oz":
      return value * 28.4130625;
  }
};

const fromMilliLiters = (mL: number, unit: VolumeUnit): number => {
  switch (unit) {
    case "mL":
      return mL;
    case "L":
      return mL / 1000;
    case "µL":
      return mL * 1000;
    case "cm³":
      return mL;
    case "m³":
      return mL / 1_000_000;
    case "US gal":
      return mL / 3785.411784;
    case "UK gal":
      return mL / 4546.09;
    case "US fl oz":
      return mL / 29.5735295625;
    case "UK fl oz":
      return mL / 28.4130625;
  }
};

const fmt = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 4 })
    : "—";

function Index() {
  const [cHigh, setCHigh] = useState("");
  const [cLow, setCLow] = useState("");
  const [cDesired, setCDesired] = useState("");
  const [volume, setVolume] = useState("");
  const [unit, setUnit] = useState<VolumeUnit>("mL");

  const result = useMemo(() => {
    const high = parseFloat(cHigh);
    const low = parseFloat(cLow);
    const desired = parseFloat(cDesired);
    const vol = parseFloat(volume);

    if (
      !Number.isFinite(high) ||
      !Number.isFinite(low) ||
      !Number.isFinite(desired) ||
      !Number.isFinite(vol) ||
      vol <= 0
    ) {
      return null;
    }
    if (high === low) return { error: "Concentrations must differ." };
    const [hi, lo] = high > low ? [high, low] : [low, high];
    if (desired < lo || desired > hi)
      return { error: "Desired must be between the two concentrations." };

    const partsHigh = desired - lo;
    const partsLow = hi - desired;
    const total = partsHigh + partsLow;
    const totalMl = toMilliLiters(vol, unit);
    const volHighMl = (totalMl * partsHigh) / total;
    const volLowMl = totalMl - volHighMl;

    return {
      volHigh: fromMilliLiters(volHighMl, unit),
      volLow: fromMilliLiters(volLowMl, unit),
      ratioHigh: partsHigh,
      ratioLow: partsLow,
      highLabel: high > low ? "A" : "B",
    };
  }, [cHigh, cLow, cDesired, volume, unit]);

  const clearAll = () => {
    setCHigh("");
    setCLow("");
    setCDesired("");
    setVolume("");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-xl px-5 py-10 sm:py-16">
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Alligation Calculator
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Mix two solutions to reach a target concentration and volume.
          </p>
        </header>

        <section className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Solution A (%)"
              value={cHigh}
              onChange={setCHigh}
              placeholder="e.g. 70"
            />
            <Field
              label="Solution B (%)"
              value={cLow}
              onChange={setCLow}
              placeholder="e.g. 20"
            />
          </div>

          <Field
            label="Desired concentration (%)"
            value={cDesired}
            onChange={setCDesired}
            placeholder="e.g. 40"
          />

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field
              label="Total volume"
              value={volume}
              onChange={setVolume}
              placeholder="e.g. 500"
            />
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">Unit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as VolumeUnit)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        <section
          aria-live="polite"
          className="rounded-lg border bg-card p-5 sm:p-6"
        >
          {!result && (
            <p className="text-sm text-muted-foreground">
              Enter values above to see the mixture.
            </p>
          )}
          {result && "error" in result && (
            <p className="text-sm text-destructive">{result.error}</p>
          )}
          {result && !("error" in result) && (
            <div className="space-y-4">
              <ResultRow
                label={`Solution A`}
                value={`${fmt(result.volHigh)} ${unit}`}
              />
              <ResultRow
                label={`Solution B`}
                value={`${fmt(result.volLow)} ${unit}`}
              />
              <Separator />
              <ResultRow
                label="Ratio (A : B)"
                value={`${fmt(result.ratioHigh)} : ${fmt(result.ratioLow)}`}
                muted
              />
            </div>
          )}
        </section>

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
          For educational and calculation support only. Does not replace
          institutional policies or independent clinical judgment.
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        inputMode="decimal"
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={
          muted
            ? "text-sm font-medium tabular-nums"
            : "text-lg font-semibold tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}
