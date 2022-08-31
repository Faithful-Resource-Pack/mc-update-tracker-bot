const { info, warning } = require("./logger");
const Keyv = require("keyv");

var jiraBedrockVersionsCache = [];

exports.loadJiraBedrockVersions = async () => {
	let status;
	let versions;

	try {
		const res = await fetch(
			"https://bugs.mojang.com/rest/api/latest/project/MCPE/versions"
		);
		status = res.status;
		versions = await res.json();
	} catch (e) {
		console.log(`${warning} Failed to load Jira Bedrock versions\n${e}`);
		return;
	}

	if (versions === "" || status !== 200) {
		console.log(`${warning} Failed to load Jira Bedrock versions, status is ${status}`);
		return;
	}

	versions.forEach((version) => {
		// uncomment to test for specific versions being released
		// if (version.name === "1.19.10") return;
		jiraBedrockVersionsCache.push(version.name);
	});

	console.log(
		`${info} Loaded ${jiraBedrockVersionsCache.length} Jira Bedrock versions`
	);
};

exports.updateJiraBedrockVersions = async (client) => {
	let status;
	let versions;

	try {
		const res = await fetch(
			"https://bugs.mojang.com/rest/api/latest/project/MCPE/versions"
		);
		status = res.status;
		versions = await res.json();
	} catch (e) {
		console.log(`${warning} Failed to update Jira Bedrock versions\n${e}`);
		return;
	}

	if (versions === "" || status !== 200) {
		console.log(`${warning} Failed to update Jira Bedrock versions, status is ${status}`);
		return;
	}

	versions.forEach(async (version) => {
		if (!jiraBedrockVersionsCache.includes(version.name)) {
			jiraBedrockVersionsCache.push(version.name);
			if (!version.name.includes("Future Version")) {
				const keyv = new Keyv("sqlite://data/data.sqlite");

				for await (const [key, value] of keyv.iterator()) {
					if (value.edition !== "java") {
						await client.channels.cache.get(key).send({
							content: `A new Minecraft Bedrock version has been added to the Minecraft issue tracker: \`${version.name}\``,
						});
					}
				}
			}
		}
	});
};
