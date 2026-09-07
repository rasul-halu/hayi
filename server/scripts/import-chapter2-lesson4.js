if (!process.argv.includes("--lesson4")) {
  process.argv.push("--lesson4");
}

await import("./import-chapter2-lesson2.js");
