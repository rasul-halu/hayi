if (!process.argv.includes("--lesson3")) {
  process.argv.push("--lesson3");
}

await import("./import-chapter2-lesson2.js");
