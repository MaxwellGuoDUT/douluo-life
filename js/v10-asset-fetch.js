// The HTML pins every local resource to the bytes of its build. No save migration.
export function createAssetFetch(fetchImpl, { assets = null, baseUrl = globalThis.document?.baseURI } = {}) {
    if (!assets) return fetchImpl;
    return (input, options = {}) => {
        const url = new URL(input, baseUrl);
        const base = new URL('./', baseUrl);
        const relative = url.href.startsWith(base.href) ? url.href.slice(base.href.length).split(/[?#]/u)[0] : null;
        const asset = relative && assets[relative];
        if (!asset) throw Object.assign(new Error(`资源未列入当前页面版本：${input}`), { code: 'ASSET_VERSION_UNKNOWN' });
        url.searchParams.set('v', asset.version);
        return fetchImpl(url.href, { ...options, integrity: asset.integrity });
    };
}
export function pageAssets(document = globalThis.document) {
    const node = document?.querySelector?.('#v10-assets');
    return node?.textContent ? JSON.parse(node.textContent) : null;
}
