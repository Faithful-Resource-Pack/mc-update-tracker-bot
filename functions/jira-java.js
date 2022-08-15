const { info, warning } = require("./logger");
const Keyv = require("keyv");

var jiraJavaVersionsCache = [];

exports.loadJiraJavaVersions = async () => {
	let status;
	let versions;

	try {
		const res = await fetch(
			"https://bugs.mojang.com/rest/api/latest/project/MC/versions"
		);
		status = res.status;
		versions = await res.json();
	} catch (e) {
		console.log(`${warning} Failed to load Jira Java versions`);
		return;
	}

	if (versions === "" || status !== 200) {
		console.log(`${warning} Failed to load Jira Java versions`);
		return;
	}

	versions.forEach((version) => {
		// uncomment to test for specific versions being released
		// if (version.name === "1.19.2") return;
		jiraJavaVersionsCache.push(version.name);
	});

	console.log(
		`${info} Loaded ${jiraJavaVersionsCache.length} Jira Java versions`
	);
};

exports.updateJiraJavaVersions = async (client) => {
	let status;
	let versions;

	try {
		const res = await fetch(
			"https://bugs.mojang.com/rest/api/latest/project/MC/versions"
		);
		status = res.status;
		versions = await res.json();
	} catch (e) {
		return;
	}

	if (versions === "" || status !== 200) {
		return;
	}

	versions.forEach(async (version) => {
		if (!jiraJavaVersionsCache.includes(version.name)) {
			jiraJavaVersionsCache.push(version.name);
			if (!version.name.includes("Future Version")) {
				const keyv = new Keyv("sqlite://data/data.sqlite");

				for await (const [key, value] of keyv.iterator()) {
					if (value.edition !== "bedrock") {
						await client.channels.cache.get(key).send({
							content: `A new Minecraft Java version has been added to the Minecraft issue tracker: \`${version.name}\``,
						});
					}
				}
			}
		}
	});
};
