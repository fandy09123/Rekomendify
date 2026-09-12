//#region node_modules/.nitro/vite/services/ssr/assets/saved-locations-DDQGcli2.js
var KEY = "rekomendify:saved-locations:v1";
function read() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function write(list) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(KEY, JSON.stringify(list));
	window.dispatchEvent(new Event("rekomendify:saved-changed"));
}
function listSaved() {
	return read().sort((a, b) => b.savedAt - a.savedAt);
}
function isSaved(id) {
	return read().some((x) => x.id === id);
}
function saveLocation(loc) {
	const list = read().filter((x) => x.id !== loc.id);
	list.push({
		...loc,
		savedAt: Date.now()
	});
	write(list);
}
function removeSaved(id) {
	write(read().filter((x) => x.id !== id));
}
//#endregion
export { saveLocation as i, listSaved as n, removeSaved as r, isSaved as t };
