const { info, warning } = require("./logger");
const Keyv = require("keyv");

var javaVersionsCache = [];

exports.loadJavaVersions = async () => {
	let status;
	let versions;

	try {
		const res = await fetch(
			"https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
		);
		status = res.status;
		versions = await res.json();
	} catch (e) {
		console.log(`${warning} Failed to load Minecraft Java versions`);
		return;
	}

	if (versions === "" || status !== 200) {
		console.log(`${warning} Failed to load Minecraft Java versions`);
		return;
	}

	versions.versions.forEach((version) => {
		// uncomment to test for specific versions being released
		// if (version.id === "1.19.2") return;
		javaVersionsCache.push(version.id);
	});

	console.log(
		`${info} Loaded ${javaVersionsCache.length} Minecraft Java versions`
	);
};

exports.updateJavaVersions = async (client) => {
	let status;
	let versions;

	try {
		const res = await fetch(
			"https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
		);
		status = res.status;
		versions = await res.json();
	} catch (e) {
		return;
	}

	if (versions === "" || status !== 200) {
		return;
	}

	versions.versions.forEach(async (version) => {
		if (!javaVersionsCache.includes(version.id)) {
			javaVersionsCache.push(version.id);
			let description = `A new version of Minecraft Java was just released: \`${version.id}\`\n\`No article link was found.\``;

			const res = await fetch(
				"https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid?tileselection=auto&tagsPath=minecraft:article/news,minecraft:stockholm/news,minecraft:stockholm/minecraft-build&pageSize=30&locale=en-us&lang=/content/minecraft-net/language-masters/en-us",
				{
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
						Accept: "application/json",
						"Accept-Language": "en-US",
						"Accept-Encoding": "gzip",
					},
				}
			);
			const articles = await res.json();

			for (let i = 0; i != articles.article_grid.length; i++) {
				if (
					articles.article_grid[
						i
					].default_tile.image.imageURL.includes(version.id) &&
					!articles.article_grid[i].default_tile.sub_header.includes(
						"Bedrock"
					)
				) {
					description = `A new version of Minecraft Java was just released: \`${version.id}\`\nhttps://www.minecraft.net${articles.article_grid[i].article_url}`;
					break;
				} else {
					if (
						version.id.includes("pre") &&
						articles.article_grid[i].default_tile.title.includes(
							`Pre-Release ${version.id.split("pre")[1]}`
						)
					) {
						description = `A new version of Minecraft Java was just released: \`${version.id}\`\nhttps://www.minecraft.net${articles.article_grid[i].article_url}`;
						break;
					} else if (
						version.id.includes("rc") &&
						articles.article_grid[i].default_tile.title.includes(
							`Release Candidate ${version.id.split("rc")[1]}`
						)
					) {
						description = `A new version of Minecraft Java was just released: \`${version.id}\`\nhttps://www.minecraft.net${articles.article_grid[i].article_url}`;
						break;
					} else if (
						articles.article_grid[i].default_tile.title.includes(
							`Java Edition ${version.id}`
						)
					) {
						description = `A new version of Minecraft Java was just released: \`${version.id}\`\nhttps://www.minecraft.net${articles.article_grid[i].article_url}`;
						break;
					}
				}
			}

			const keyv = new Keyv("sqlite://data/data.sqlite");

			for await (const [key, value] of keyv.iterator()) {
				if (value.edition !== "bedrock") {
					await client.channels.cache.get(key).send({
						content: description,
					});
				}
			}
		}
	});
};
