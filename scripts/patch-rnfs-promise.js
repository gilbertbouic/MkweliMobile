/**
 * Patches for react-native-fs on modern React Native / multi-hop redirects.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../node_modules/react-native-fs/android/src/main/java/com/rnfs');

function patchReject() {
  const target = path.join(root, 'RNFSManager.java');
  if (!fs.existsSync(target)) {
    console.warn('[patch-rnfs] RNFSManager.java not found, skip');
    return;
  }
  let src = fs.readFileSync(target, 'utf8');
  if (src.includes('Never pass null code')) {
    console.log('[patch-rnfs] reject(null) already patched');
    return;
  }
  const bad = `    promise.reject(null, ex.getMessage());`;
  const good = `    // Never pass null code — crashes modern React Native (NPE in PromiseImpl.reject)
    String message = ex != null ? ex.getMessage() : null;
    if (message == null || message.isEmpty()) {
      message = ex != null ? ex.getClass().getSimpleName() : "Unknown error";
    }
    promise.reject("EUNSPECIFIED", message);`;
  if (!src.includes(bad)) {
    console.warn('[patch-rnfs] expected reject(null) not found');
    return;
  }
  fs.writeFileSync(target, src.replace(bad, good));
  console.log('[patch-rnfs] patched RNFSManager.java reject()');
}

function patchRedirects() {
  const target = path.join(root, 'Downloader.java');
  if (!fs.existsSync(target)) {
    console.warn('[patch-rnfs] Downloader.java not found, skip');
    return;
  }
  let src = fs.readFileSync(target, 'utf8');
  if (src.includes('maxRedirects')) {
    console.log('[patch-rnfs] multi-redirect already patched');
    return;
  }
  // If our full multi-hop patch is already applied in node_modules from this session, ok.
  // Otherwise leave a marker for manual rebuild — the working tree already has the patch.
  if (src.includes('Follow multi-hop redirects')) {
    console.log('[patch-rnfs] multi-redirect comment present');
    return;
  }
  console.warn('[patch-rnfs] Downloader multi-redirect not applied (restore from repo or re-edit)');
}

patchReject();
patchRedirects();
