import { cp, mkdir } from "node:fs/promises";

const targets = [
  "windows-x64",
  // "windows-arm64" // bun build not yet support arm64 on windows.
  "mac-x64",
  "mac-arm64",
  "linux-x64",
  "linux-arm64",
];

for (const target of targets) {
  await mkdir(`package/${target}`, { recursive: true });

  await cp("static/", `package/${target}/static`, { recursive: true });
  if (target.startsWith("windows")) {
    await cp(`build/${target}.exe`, `package/${target}/mrdamian.exe`);
  } else {
    await cp(`build/${target}`, `package/${target}/mrdamian`);
  }
  await cp(
    "LICENSES.dependency.html",
    `package/${target}/LICENSES.dependency.html`,
  );
}
