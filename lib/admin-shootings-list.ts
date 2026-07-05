export const ADMIN_SHOOTINGS_PAGE_SIZE = 25;

export type ShootingListView = "events" | "einzel";

export type AdminShootingsSearchParams = {
  ansicht?: string;
  page?: string;
  q?: string;
  status?: string;
};

export type ParsedShootingsListParams = {
  view: ShootingListView;
  page: number;
  q: string;
  status: string | undefined;
};

export function parseShootingsListParams(
  searchParams: AdminShootingsSearchParams,
): ParsedShootingsListParams {
  const view: ShootingListView =
    searchParams.ansicht === "einzel" ? "einzel" : "events";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const q = (searchParams.q ?? "").trim();
  const status = searchParams.status?.trim() || undefined;

  return { view, page, q, status };
}

export function buildShootingsListUrl(
  params: {
    ansicht?: ShootingListView;
    page?: number;
    q?: string;
    status?: string;
  },
  basePath = "/admin/shootings",
): string {
  const sp = new URLSearchParams();

  if (params.ansicht === "einzel") {
    sp.set("ansicht", "einzel");
  }
  if (params.page && params.page > 1) {
    sp.set("page", String(params.page));
  }
  if (params.q) {
    sp.set("q", params.q);
  }
  if (params.status) {
    sp.set("status", params.status);
  }

  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function getShootingsTotalPages(total: number, pageSize = ADMIN_SHOOTINGS_PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}
