const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const Keyv = require("keyv");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("track-updates")
		.setDescription("Starts tracking Minecraft updates")
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName("edition")
				.setDescription("Which Minecraft edition to track")
				.addChoices(
					{ name: "Java", value: "java" },
					{ name: "Bedrock", value: "bedrock" },
					{ name: "Both", value: "both" }
				)
				.setRequired(true)
		)
		.addChannelOption((option) =>
			option
				.setName("channel")
				.setDescription(
					"Leaving this field empty will use the current channel"
				)
				.setRequired(false)
		)
		/*.addBooleanOption((option) =>
			option
				.setName("post-previous-update")
				.setDescription("Posts the previous Minecraft upate")
				.setRequired(false)
		)*/
		// Only allows server admins to use the command
		.setDefaultMemberPermissions(0),
	async execute(interaction, client) {
		let embed = new EmbedBuilder();

		if (!interaction.guild.members.me.permissions.has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.UseExternalEmojis])) {
			embed
				.setTitle("You didn't give me enough permissions to work properly on this server, please remove and invite me again")
				.setColor("#ff6666")
				.setTimestamp();

			await interaction.reply({ embeds: [embed], ephemeral: true });
			return;
		}

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
				? await keyv.has(interaction.options.getChannel("channel").id)
				: await keyv.has(interaction.channel.id)
		) {
			embed
				.setTitle(
					`Update tracking is already set up for ${
						interaction.options.getChannel("channel")
							? interaction.options.getChannel("channel").name
							: "this channel"
					}`
				)
				.setColor("#ff6666")
				.setDescription(
					"You can use:\n- `/edit-updates` to edit the update tracker\n- `/stop-updates` to stop the update tracker"
				)
				.setTimestamp();
		} else {
			await keyv.set(
				interaction.options.getChannel("channel")
					? interaction.options.getChannel("channel").id
					: interaction.channel.id,
				{
					server: interaction.guild.id,
					edition: interaction.options.getString("edition"),
				}
			);

			embed
				.setTitle("Success")
				.setColor("#42b983")
				.setDescription(
					`${
						interaction.options.getChannel("channel")
							? interaction.options.getChannel("channel")
							: `<#${interaction.channel.id}>`
					} will now recieve Minecraft updates.`
				)
				.setTimestamp();
		}

		await interaction.reply({ embeds: [embed] });
	},
};
