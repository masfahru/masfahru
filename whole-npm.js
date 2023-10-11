import packageJson from "./package.json";
import fs from "fs";
import { load } from "all-package-names";

await load().then(({ packageNames }) => {
    const total = packageNames.length;
    packageJson.dependencies = {};

    for (let i = 0; i < total; i++) {
        packageJson.dependencies[packageNames[i]] = 'latest';
    }
    console.log(`Found ${total} dependencies`);
    fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
});

process.exit(0)