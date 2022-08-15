const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("feedback")
		.setDescription("Send suggestions or bug reports to the bot developers")
		.addStringOption((option) =>
			option
				.setName("message")
				.setDescription("Write your feedback here")
				.setRequired(true)
		)
		.addAttachmentOption((option) =>
			option
				.setName("image")
				.setDescription(
					"OPTIONAL - Attach an image to the suggestion or bug here"
				)
				.setRequired(false)
		),
	async execute(interaction, client) {
		const embed_user = new EmbedBuilder()
			.setTitle("Your feedback has been sent to the developers")
			.setDescription(interaction.options.getString("message"))
			.setTimestamp()
			.setFooter({
				text: "This message will be automatically updated with the status of your feedback",
			});

		let embed_dev = new EmbedBuilder()
			.setTitle(`Feedback from ${interaction.user.tag}`)
			.setThumbnail(interaction.user.avatarURL())
			.setDescription(interaction.options.getString("message"))
			.setTimestamp();
		if (interaction.options.getAttachment("image")) {
			if (
				![
					".jpg",
					".jpeg",
					".png",
					".gif",
					".mp4",
					".webm",
					".webp",
				].some((extension) =>
					interaction.options
						.getAttachment("image")
						.url.endsWith(extension)
				)
			)
				embed_user.setDescription(
					`Your attachment will not be sent due to not being a valid image or video\n\n${interaction.options.getString(
						"message"
					)}`
				);
			else
				embed_dev.setImage(
					interaction.options.getAttachment("image").url
				);
		}

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId("implemented")
				.setLabel("implemented")
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId("close")
				.setLabel("close")
				.setStyle(ButtonStyle.Danger),
			new ButtonBuilder()
				.setCustomId("in-progress")
				.setLabel("in progress")
				.setStyle(ButtonStyle.Primary)
		);

		await interaction.reply({ embeds: [embed_user] });
		embed_dev.setFooter({
			text: `${interaction.channel.id} - ${await interaction
				.fetchReply()
				.then((reply) => reply.id)}`,
		});
		await client.channels.cache
			.get(process.env.REPORTS_CHANNEL)
			.send({ embeds: [embed_dev], components: [row] });
	},
};
