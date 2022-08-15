const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Keyv = require("keyv");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stop-updates")
		.setDescription("Stops tracking Minecraft updates")
		.setDMPermission(false)
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription(
					"Leaving this field empty will use the current channel"
				)
				.setRequired(false)
		)
		// Only allows server admins to use the command
		.setDefaultMemberPermissions(0),
	async execute(interaction, client) {
		let embed = new EmbedBuilder();

		// Channel type 0 = text channel
		// See https://discord-api-types.dev/api/discord-api-types-v10/enum/ChannelType for more
		if (
			interaction.options.getChannel("channel") &&
			interaction.options.getChannel("channel").type !== 0
		) {
			embed
				.setTitle(`Update tracking can only be used in text channels`)
				.setColor("#ff6666")
				.setDescription("Voice channels or categories can't be used.")
				.setTimestamp();

			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		const keyv = new Keyv("sqlite://data/data.sqlite");

		if (
			interaction.options.getChannel("channel")
				? !(await keyv.has(
						interaction.options.getChannel("channel").id
				  ))
				: !(await keyv.has(interaction.channel.id))
		) {
			embed
				.setTitle(
					`Update tracking is not set up for ${
						interaction.options.getChannel("channel")
							? interaction.options.getChannel("channel").name
							: "this channel"
					}`
				)
				.setColor("#ff6666")
				.setDescription(
					"You can use:\n- `/add-updates` to start the update tracker"
				)
				.setTimestamp();
		} else {
			await keyv.delete(
				interaction.options.getChannel("channel")
					? interaction.options.getChannel("channel").id
					: interaction.channel.id
			);

			embed
				.setTitle("Success")
				.setColor("#42b983")
				.setDescription(
					`The update tracker for ${
						interaction.options.getChannel("channel")
							? interaction.options.getChannel("channel")
							: `<#${interaction.channel.id}>`
					} has been stopped.`
				)
				.setTimestamp();
		}

		await interaction.reply({ embeds: [embed] });
	},
};
