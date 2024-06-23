import fs from "node:fs/promises";
import checker, { type ModuleInfos } from "license-checker";

export function checkDependency(): Promise<ModuleInfos> {
  return new Promise((resolve, reject) => {
    checker.init({ start: "./", production: true }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const allowedLicenes: string[] = [
  "0BSD",
  "Apache-2.0",
  "BlueOak-1.0.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "BSD*",
  "CC-BY-3.0",
  "CC0-1.0",
  "ISC",
  "MIT",
  "Python-2.0",
  "(MIT AND CC-BY-3.0)",
  "MIT OR Apache-2.0",
];

function matchLicenses(licenses: string | string[] | undefined): boolean {
  if (!licenses) return false;
  if (licenses.length === 0) return false;
  return [licenses].flat().some((val) => allowedLicenes.includes(val));
}

export async function generateDependencyLicenses(
  mods: ModuleInfos,
): Promise<string> {
  const licenses = await Promise.all(
    Object.entries(mods).map(async ([name, pkg]) => {
      if (!matchLicenses(pkg.licenses)) {
        throw `package "${name}"(${pkg.licenses}) is not match with our license policy.`;
      }

      let licenseFile = pkg.licenseFile;
      if (!licenseFile || /README/.test(licenseFile)) {
        licenseFile = undefined;
      }

      let license = "";
      license += "<div>";
      license += `<span class="title">${name}</span>`;
      license += `<span class="license">${pkg.licenses}</span>`;
      if (pkg.copyright)
        license += `<span class="copyright">${pkg.copyright}</span>`;
      if (pkg.publisher)
        license += `<span class="publisher">${pkg.publisher}</span>`;
      if (pkg.repository)
        license += `<span class="homepage"><a href="${pkg.repository}">${pkg.repository}</a></span>`;
      if (licenseFile) {
        const data = await fs.readFile(licenseFile);
        license += `<div class="license_file"><pre>${data}</pre></div>`;
      } else {
        const licenses = pkg.licenses ?? [];
        if (licenses.includes("MIT")) {
          license += `<div class="license_file"><a href="https://opensource.org/license/mit">MIT License</a></pre></div>`;
        }
      }
      if (pkg.noticeFile) {
        const data = await fs.readFile(pkg.noticeFile);
        license += `<div class="notice_file"><pre>${data}</pre></div>`;
      }
      license += "</div>";
      return license;
    }),
  );

  return `
    <!doctype html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <style>
          .title {
            display: block;
          }
          .copyright {
            display: block;
          }
          .publisher {
            display: block;
          }
          .homepage {
            display: block;
          }
        </style>
      </head>
      <body>
        <h1>Credits</h1>
        ${licenses.join("\n")}
      </body>
    </html>
  `;
}

const mods = await checkDependency();
const licenses = await generateDependencyLicenses(mods);
await fs.writeFile("LICENSES.dependency.html", licenses);
