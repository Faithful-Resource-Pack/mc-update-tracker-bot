const fs = require("node:fs");
const path = require("node:path");
const {
	Client,
	Collection,
	GatewayIntentBits,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	ActivityType,
} = require("discord.js");
const { success } = require("./functions/logger");
const {
	loadJiraJavaVersions,
	updateJiraJavaVersions,
} = require("./functions/jira-java");
const {
	loadJiraBedrockVersions,
	updateJiraBedrockVersions,
} = require("./functions/jira-bedrock");
const { loadJavaVersions, updateJavaVersions } = require("./functions/java");
const {
	loadBedrockVersions,
	updateBedrockVersions,
} = require("./functions/bedrock");
const { sendErrorMessage } = require("./functions/errorHandler");
require("dotenv").config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
	if (!fs.existsSync("./data")) {
		fs.mkdirSync("./data");
	}
	fs.writeFile("./data/data.sqlite", "", { flag: "wx" }, function (err) {
		if (err) {
			return;
		}
	});

	console.log(`${success} ${client.user.tag} is online`);
	client.user.setActivity('/track-updates', { type: ActivityType.Listening });
	await loadJiraJavaVersions();
	await loadJiraBedrockVersions();
	await loadJavaVersions();
	await loadBedrockVersions();
	setInterval(async () => {
		await updateJiraJavaVersions(client);
		await updateJiraBedrockVersions(client);
		await updateJavaVersions(client);
		await updateBedrockVersions(client);
	}, 60000);
});

client.on("interactionCreate", async (interaction) => {
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction, client);
		} catch (error) {
			const embed = new EmbedBuilder()
				.setTitle(
					`There has been an error while executing this command!`
				)
				.setDescription(
					"The error has been sent to the developers.\n\nIf you know what exactly caused the error, please create a bug report using the `/feedback` command."
				)
				.setColor("#ff6666")
				.setTimestamp();

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
			await sendErrorMessage(
				client,
				error,
				`command: ${interaction.commandName}`
			);
		}
	} else if (interaction.isButton()) {
		if (interaction.channel.id !== process.env.REPORTS_CHANNEL) return;

		const origin_channel_id =
			interaction.message.embeds[0].footer.text.split(" - ")[0];
		const origin_message_id =
			interaction.message.embeds[0].footer.text.split(" - ")[1];
		const origin_message = await client.channels.cache
			.get(origin_channel_id)
			.messages.fetch(origin_message_id);

		let embed_user = new EmbedBuilder(
			origin_message.embeds[0].data
		).setTimestamp();
		let embed_dev = new EmbedBuilder(
			interaction.message.embeds[0].data
		).setTimestamp();

		if (interaction.customId === "implemented") {
			embed_user
				.setTitle("Feedback status: implemented")
				.setColor("#42b983")
				.setFooter({ text: "\u200B" });
			embed_dev.setColor("#42b983");

			await interaction.reply({
				content: "Feedback status has been set to `implemented`",
				ephemeral: true,
			});
		} else if (interaction.customId === "close") {
			const modal = new ModalBuilder()
				.setCustomId("reasonModal")
				.setTitle("Reason for closing");

			const reasonInput = new TextInputBuilder()
				.setCustomId("reasonInput")
				.setLabel("Reason")
				.setStyle(TextInputStyle.Short);

			const actionRow = new ActionRowBuilder().addComponents(reasonInput);
			modal.addComponents(actionRow);
			await interaction.showModal(modal);

			const submitted = await interaction.awaitModalSubmit({
				time: 60000 * 3,
				filter: (i) => i.user.id === interaction.user.id,
			});

			if (submitted) {
				embed_user.setDescription(
					`Reason for closing: \`${submitted.fields.getTextInputValue(
						"reasonInput"
					)}\`\n\n${origin_message.embeds[0].data.description}`
				);
				submitted.reply({
					content: "Reason for closing has been sent.",
					ephemeral: true,
				});
			}

			embed_user
				.setTitle("Feedback status: closed")
				.setColor("#ff6666")
				.setFooter({ text: "\u200B" });
			embed_dev.setColor("#ff6666");
		} else {
			// "in progress" button
			embed_user
				.setTitle("Feedback status: in progress")
				.setColor("#5865f2");
			embed_dev.setColor("#5865f2");

			interaction.reply({
				content: "Feedback status has been set to `in progress`",
				ephemeral: true,
			});
		}

		await origin_message.edit({ embeds: [embed_user] });
		await interaction.message.edit({ embeds: [embed_dev] });
	} else return;
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;

	if (message.author.id !== process.env.OWNER_ID) return;

	if (message.content.startsWith("m!eval")) {
		const clean = async (text) => {
			if (text && text.constructor.name === "Promise") text = await text;
			if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });

			text = text
				.replaceAll(process.env.TOKEN, "[CENSORED]")
				.replaceAll(process.env.ERROR_CHANNEL, "[CENSORED]")
				.replaceAll(process.env.REPORTS_CHANNEL, "[CENSORED]")
				.replace(/`/g, "`" + String.fromCharCode(8203))
				.replace(/@/g, "@" + String.fromCharCode(8203));

			return text;
		};

		const code = message.content.slice(6)
		const evaluated = await eval(`(async () => { try { return await (async () => {${code.includes('return') ? code : `return ${code}`}})() } catch (e) { return e } })()`);
		await message.reply({ content: `\`\`\`js\n${(await clean(evaluated)).slice(0, 4085)}\`\`\`` })
	}
})

process.on("uncaughtException", async function (error) {
	await sendErrorMessage(client, error);
});

client.login(process.env.TOKEN);
