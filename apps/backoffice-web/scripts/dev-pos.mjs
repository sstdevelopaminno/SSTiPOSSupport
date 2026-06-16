process.env.PORT = process.env.PORT || "3000";
process.env.APP_SURFACE = process.env.APP_SURFACE || "pos";
process.env.NEXT_DEV_BUNDLER = process.env.NEXT_DEV_BUNDLER || "webpack";

console.log("[dev-pos] SSTiPOS POS Preview: http://localhost:3000/login/store");

await import("./dev-safe.mjs");
