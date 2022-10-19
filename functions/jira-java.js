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
		console.log(`${warning} Failed to load Jira Java versions\n${e}`);
		return;
	}

	if (versions === "" || status !== 200) {
		console.log(`${warning} Failed to load Jira Java versions, status is ${status}`);
		return;
	}

	versions.forEach((version) => {
		// uncomment to test for specific versions being released
		// if (version.name === "22w42a") return;
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
		console.log(`${warning} Failed to update Jira Java versions\n${e}`);
		return;
	}

	if (versions === "" || status !== 200) {
		console.log(`${warning} Failed to update Jira Java versions, status is ${status}`);
		return;
	}

	versions.forEach(async (version) => {
		if (!jiraJavaVersionsCache.includes(version.name)) {
			jiraJavaVersionsCache.push(version.name);
			if (!version.name.includes("Future Version")) {
				const keyv = new Keyv("sqlite://data/data.sqlite");

				for await (const [key, value] of keyv.iterator()) {
					if (value.edition !== "bedrock") {
						try {
							await client.channels.cache.get(key).send({
								content: `A new Minecraft Java version has been added to the Minecraft issue tracker: \`${version.name}\``,
							});
						}
						catch(e) {}
					}
				}

				console.log(`${info} A new Minecraft Java version has been added to the Minecraft issue tracker: ${version.name}`)
			}
		}
	});
};
