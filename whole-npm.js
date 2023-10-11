const packageJson = require("./package.json");
const fs = require("fs");
const currentDependencies = packageJson.dependencies;

const json = await fetch("https://replicate.npmjs.com/_all_docs").then(res => res.json());

packageJson.dependencies = {};

let foundNewDeps = 0;
for (let i = 0; i < json.total_rows; i++) {
  if (!currentDependencies[json.rows[i].id]) {
    foundNewDeps++;
  }

  packageJson.dependencies[json.rows[i].id] = '*';
}
console.log(`Found ${foundNewDeps} new dependencies`);
fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));