export const HISTORY_PAGE_SIZE = 50;
// Scan only until one page of visible text is found; never build DOM for the whole timeline.
export function historyWindow(timeline, end = timeline.length, pageSize = HISTORY_PAGE_SIZE) {
    const stop = Math.min(Math.max(0, end), timeline.length);
    const entries = [];
    let start = stop;
    while (start > 0 && entries.length < pageSize) {
        const entry = timeline[--start];
        if (typeof entry?.text === 'string' && entry.text.trim()) entries.push(entry);
    }
    entries.reverse();
    return { start, end: stop, entries };
}
export function createV10HistoryView({ list, older, newer, latest, status, getTimeline, document = globalThis.document }) {
    // null follows the latest page; a numeric end anchors an older page across appends.
    let end = null;
    function render() {
        const timeline = getTimeline();
        const window = historyWindow(timeline, end ?? timeline.length);
        list.replaceChildren(...window.entries.map(entry => {
            const item = document.createElement('li');
            item.textContent = entry.text;
            return item;
        }));
        list.start = window.start + 1;
        older.disabled = window.start === 0;
        newer.disabled = window.end >= timeline.length;
        latest.disabled = end === null;
        status.textContent = window.entries.length
            ? `记录 ${window.start + 1}–${window.end} / ${timeline.length}` : '暂无记事';
        return window;
    }
    older.addEventListener('click', () => {
        end = historyWindow(getTimeline(), end ?? getTimeline().length).start;
        render();
    });
    newer.addEventListener('click', () => {
        const timeline = getTimeline();
        let next = end ?? timeline.length;
        let count = 0;
        while (next < timeline.length && count < HISTORY_PAGE_SIZE) {
            const entry = timeline[next++];
            if (typeof entry?.text === 'string' && entry.text.trim()) count++;
        }
        end = next >= timeline.length ? null : next;
        render();
    });
    latest.addEventListener('click', () => { end = null; render(); });
    return { render, reset() { end = null; } };
}
