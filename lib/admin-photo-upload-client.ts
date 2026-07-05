import type { BulkUploadResult, ParticipantUploadResult } from "@/lib/admin-photo-upload";

async function parseJsonResponse<T>(response: Response): Promise<T | { error: string }> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    const snippet = text.replace(/\s+/g, " ").slice(0, 120);
    return {
      error: response.ok
        ? "Unerwartete Server-Antwort."
        : `Upload fehlgeschlagen (${response.status})${snippet ? `: ${snippet}` : ""}`,
    };
  }

  try {
    return (await response.json()) as T;
  } catch {
    return { error: "Server-Antwort konnte nicht gelesen werden." };
  }
}

export async function postParticipantPhotoUpload(
  formData: FormData,
): Promise<ParticipantUploadResult> {
  try {
    const response = await fetch("/api/admin/photos/participant", {
      method: "POST",
      body: formData,
    });
    const data = await parseJsonResponse<ParticipantUploadResult>(response);
    if ("error" in data && !("success" in data)) {
      return { error: data.error };
    }
    if (!response.ok && "error" in data) {
      return { error: data.error };
    }
    return data as ParticipantUploadResult;
  } catch {
    return { error: "Netzwerkfehler beim Upload – bitte erneut versuchen." };
  }
}

export async function postBulkPhotoUpload(
  formData: FormData,
): Promise<BulkUploadResult | { error: string }> {
  try {
    const response = await fetch("/api/admin/photos/bulk", {
      method: "POST",
      body: formData,
    });
    const data = await parseJsonResponse<BulkUploadResult>(response);
    if ("error" in data && !("success" in data)) {
      return { error: data.error };
    }
    if (!response.ok && "error" in data) {
      return { error: data.error };
    }
    return data as BulkUploadResult;
  } catch {
    return { error: "Netzwerkfehler beim Upload – bitte erneut versuchen." };
  }
}
