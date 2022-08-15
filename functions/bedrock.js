const { info, warning } = require("./logger");
const Keyv = require("keyv");

var javaVersionsCache = [];

exports.loadBedrockVersions = async () => {
	let status;
	let versions;

	try {
		const res = await fetch(
			"https://bugs.mojang.com/rest/api/latest/project/MCPE/versions"
		);
		status = res.status;
		versions = await res.json();
	} catch (e) {
		console.log(`${warning} Failed to load Minecraft Bedrock versions`);
		return;
	}

	if (versions === "" || status !== 200) {
		console.log(`${warning} Failed to load Minecraft Bedrock versions`);
		return;
	}

	versions.forEach((version) => {
		// uncomment to test for specific versions being released
		// if (version.name === "1.19.20") return;
		javaVersionsCache.push(version.name.split(" ")[0]);
	});

	console.log(
		`${info} Loaded ${javaVersionsCache.length} Minecraft Bedrock versions`
	);
};

exports.updateBedrockVersions = async (client) => {
	let status;
	let versions;

	try {
		const res = await fetch(
			"https://bugs.mojang.com/rest/api/latest/project/MCPE/versions"
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
		if (!javaVersionsCache.includes(version.name.split(" ")[0])) {
			javaVersionsCache.push(version.name.split(" ")[0]);
			let description = `A new version of Minecraft Bedrock was just released: \`${version.name}\`\n\`No article link was found.\``;

			const res = await fetch(
				"https://feedback.minecraft.net/api/v2/help_center/en-us/articles.json"
			);
			const articles = await res.json();

			for (let i = 0; i != articles.articles.length; i++) {
				if (
					articles.articles[i].name.includes(
						`${version.name.split(" ")[0]} (Bedrock)`
					)
				) {
					description = `A new version of Minecraft Bedrock was just released: \`${version.name}\`\n${articles.articles[i].html_url}`;
					break;
				} else if (
					articles.articles[i].name.includes(
						`Beta & Preview - ${version.name.split(" ")[0]}`
					)
				) {
					description = `A new version of Minecraft Bedrock was just released: \`${version.name}\`\n${articles.articles[i].html_url}`;
					break;
				}

				/*if (
					articles.article_grid[
						i
					].default_tile.image.imageURL.includes(version.id) &&
					!articles.article_grid[i].default_tile.sub_header.includes(
						"Bedrock"
					)
				) {
					description = `A new version of Minecraft Java was just released: \`${version.name}\`\nhttps://www.minecraft.net${articles.article_grid[i].article_url}`;
					break;
				} else {
					if (
						version.name.includes("pre") &&
						articles.article_grid[i].default_tile.title.includes(
							`Pre-Release ${version.name.split("pre")[1]}`
						)
					) {
						description = `A new version of Minecraft Java was just released: \`${version.name}\`\nhttps://www.minecraft.net${articles.article_grid[i].article_url}`;
						break;
					} else if (
						version.name.includes("rc") &&
						articles.article_grid[i].default_tile.title.includes(
							`Release Candidate ${version.name.split("rc")[1]}`
						)
					) {
						description = `A new version of Minecraft Java was just released: \`${version.name}\`\nhttps://www.minecraft.net${articles.article_grid[i].article_url}`;
						break;
					} else if (
						articles.article_grid[i].default_tile.title.includes(
							`Java Edition ${version.name}`
						)
					) {
						description = `A new version of Minecraft Java was just released: \`${version.name}\`\nhttps://www.minecraft.net${articles.article_grid[i].article_url}`;
						break;
					} else {
						description = `A new version of Minecraft Java was just released: \`${version.name}\`\n\`No article link was found.\``;
						break;
					}
				}*/
			}

			const keyv = new Keyv("sqlite://data/data.sqlite");

			for await (const [key, value] of keyv.iterator()) {
				if (value.edition !== "java") {
					await client.channels.cache.get(key).send({
						content: description,
					});
				}
			}
		}
	});
};
