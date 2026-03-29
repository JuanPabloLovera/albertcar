import { createHash } from "node:crypto";

import type { OilForm } from "@/lib/types";

function maskVisibleEdges(value: string, keepStart = 2, keepEnd = 2) {
  const clean = value.trim();
  if (!clean) return "";
  if (clean.length <= keepStart + keepEnd) return "*".repeat(clean.length);

  return `${clean.slice(0, keepStart)}${"*".repeat(clean.length - keepStart - keepEnd)}${clean.slice(-keepEnd)}`;
}

export function detectSensitiveFlags(formData?: Partial<OilForm>) {
  return {
    hasName: Boolean(formData?.nombre?.trim()),
    hasPhone: Boolean(formData?.telefono?.trim()),
    hasPlate: Boolean(formData?.patente?.trim()),
  };
}

export function redactOilFormForStorage(formData?: Partial<OilForm>) {
  if (!formData) return undefined;

  return {
    nombre: formData.nombre ? maskVisibleEdges(formData.nombre, 1, 0) : "",
    telefono: formData.telefono ? maskVisibleEdges(formData.telefono, 2, 2) : "",
    patente: formData.patente ? maskVisibleEdges(formData.patente, 2, 2) : "",
    marca: formData.marca || "",
    modelo: formData.modelo || "",
    anio: formData.anio || "",
    motor: formData.motor || "",
    kilometraje: formData.kilometraje || "",
    combustible: formData.combustible || "",
  };
}

export function createVehicleFingerprint(formData?: Partial<OilForm>) {
  const seed = [formData?.marca, formData?.modelo, formData?.anio, formData?.motor, formData?.combustible]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .join("|");

  if (!seed.replace(/\|/g, "")) return "";

  return createHash("sha256").update(seed).digest("hex").slice(0, 16);
}
