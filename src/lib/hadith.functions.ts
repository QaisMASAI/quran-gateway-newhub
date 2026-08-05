// Temporary compatibility shim.
// Hadith features were removed from the app, but the dev server still had a stale
// module reference to this path during HMR. Keeping this empty module prevents
// unresolved-import crashes while remaining Hadith references are cleaned up.
export {};
