import { createHash } from 'node:crypto';

// Source APK modules are byte-preserved by .gitattributes (-text).
// Other pinned assets use LF on every checkout so Git and HTTP bytes agree.
export function assetDigests(path, bytes) {
    if (!path.startsWith('data/v10/source-runtime/') && bytes.includes(Buffer.from('\r\n'))) {
        throw new Error('Pinned text asset must use LF before generating versions: ' + path);
    }
    return {
        version: createHash('sha256').update(bytes).digest('hex').slice(0, 20),
        integrity: 'sha384-' + createHash('sha384').update(bytes).digest('base64')
    };
}
