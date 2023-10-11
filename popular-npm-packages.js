// https://github.com/LeoDog896/npm-rank/blob/main/scripts/index.ts

import packageJson from "./package.json";
import z from "zod";
import fs from "fs";

const requestAmount = 40;
const maxPackage = 10000;
let completed = 0;

function buildURL(index, max = 250) {
	return `https://registry.npmjs.com/-/v1/search?size=${max}&popularity=1.0&quality=0.0&maintenance=0.0&text=boost-exact:false&from=${index
		}`;
}

function pageURL(page) {
	return buildURL(page * 250);
}

const PackageSchema = z.object({
	name: z.string(),
	version: z.string(),
	description: z.string().optional(),
	keywords: z.array(z.string()).optional(),
	publisher: z.object({
		username: z.string(),
		email: z.string(),
	}),
	maintainers: z.array(z.object({
		username: z.string(),
		email: z.string(),
	})).optional(),
	links: z.object({
		npm: z.string(),
		homepage: z.string().optional(),
		repository: z.string().optional(),
	}),
});

const FetchSchema = z.object({
	objects: z.array(z.object({
		package: PackageSchema,
	})),
});

async function getPage(page) {
	const request = await fetch(pageURL(page));

	const { objects } = FetchSchema.parse(await request.json());

	return objects.map((obj) => obj.package);
}

const packageRequests = Array.from({ length: requestAmount });

for (let i = 0; i < requestAmount; i++) {
	const packages = await getPage(i);
	completed++;
	console.log(`Completed ${completed} of ${requestAmount} requests.`);
	packageRequests[i] = { packages };
}

const packages = packageRequests.flatMap((req) => req.packages);

if (packages.length !== maxPackage) {
	const fetchURL = buildURL(packages.length, 3);

	console.log(`Fetching remaining ${maxPackage - packages.length} packages from ${fetchURL}...`);

	const request = await fetch(fetchURL);

	const { objects } = FetchSchema.parse(await request.json());

	packages.push(...objects.map((obj) => obj.package));

	console.log(`Fetched an extra ${objects.length} packages.`);
}

packageJson.dependencies = {};
packages.forEach(item => {
	packageJson.dependencies[item.name] = 'latest';
})

console.log(`Found ${packages.length} dependencies`);
fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
process.exit(0)