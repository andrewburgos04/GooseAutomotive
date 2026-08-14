export function compressImage(file: File, max = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, max / img.width);
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.55));
    };
    img.onerror = () => reject(new Error("image"));
    img.src = url;
  });
}

export async function decodeVin(vin: string) {
  const clean = vin.trim().toUpperCase();
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(clean)}?format=json`);
    if (res.ok) {
      const data = (await res.json()) as { Results?: Array<Record<string, string>> };
      const row = data.Results?.[0];
      if (row?.Make && row.Make !== "Not Applicable") {
        return {
          year: Number(row.ModelYear) || undefined,
          make: row.Make,
          model: row.Model,
          body: row.BodyClass,
          engine: row.DisplacementL ? `${row.DisplacementL}L` : undefined,
          drive: row.DriveType,
        };
      }
    }
  } catch {
    /* demo fallback */
  }
  const yearCodes: Record<string, number> = {
    A: 2010, B: 2011, C: 2012, D: 2013, E: 2014, F: 2015, G: 2016, H: 2017, J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024,
  };
  return {
    year: yearCodes[clean[9]] ?? undefined,
    make: undefined,
    model: undefined,
    body: "NHTSA lookup unavailable — year decoded from VIN",
    engine: undefined,
    drive: undefined,
  };
}

export function partsMarkup(cost: number, matrix: { under20: number; under50: number; under150: number; over: number }) {
  if (cost < 20) return cost * matrix.under20;
  if (cost < 50) return cost * matrix.under50;
  if (cost < 150) return cost * matrix.under150;
  return cost * matrix.over;
}

export const LABEL_COPY: Record<string, string> = {
  waiting_parts: "Waiting on parts",
  customer_waiting: "Customer waiting",
  come_back: "Come back",
  warranty: "Warranty",
  fleet: "Fleet",
  euro: "Euro",
};
