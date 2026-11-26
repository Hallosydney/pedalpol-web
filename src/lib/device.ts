const HANDLE_KEY = "pp_last_handle_v1";
const BIKE_KEY = "pp_last_bike_v1";

export function getSavedRiderProfile(): { handle: string; bike: string } {
  if (typeof window === "undefined") return { handle: "", bike: 'Commuter 26"' };
  return {
    handle: window.localStorage.getItem(HANDLE_KEY) || "",
    bike: window.localStorage.getItem(BIKE_KEY) || 'Commuter 26"',
  };
}

export function saveRiderProfile(handle: string, bike: string): void {
  if (typeof window === "undefined") return;
  if (handle.trim()) window.localStorage.setItem(HANDLE_KEY, handle.trim());
  if (bike.trim()) window.localStorage.setItem(BIKE_KEY, bike.trim());
}
