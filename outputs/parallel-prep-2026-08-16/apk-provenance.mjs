export const APK_SHA256 = "E4FB340EF0DAD857A018E2F06982D32623BDD683B22BD44230A2257C35DAA11C";
export const APK_SHA_PREFIX = APK_SHA256.slice(0, 8);
export const APK_ANALYSIS_ROOT = `apk-analysis/${APK_SHA_PREFIX}`;

export function requireApkSha256(value, label = "APK source SHA-256") {
    const normalized = String(value ?? "").toUpperCase();
    if (normalized !== APK_SHA256) {
        throw new Error(`${label} must be ${APK_SHA256}, got ${normalized || "<missing>"}.`);
    }
    return normalized;
}
