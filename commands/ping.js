const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const quotes = [
	"Feeling cute, might delete later",
	"https://youtu.be/dQw4w9WgXcQ",
	`Will become real in ${(new Date().getFullYear() + 2).toString()}`,
	"I know what you did on January 23rd 2018 at 2:33 am",
	"I am 100 meters from your location and rapidly approaching. Start running...",
	"Open your mind. ~Mr. Valve",
	"Open your eyes. ~Mr. Valve",
	"Yeah it's sour cream mmm I love drinking sour cream out of a bowl",
	"*elevator music*",
	"Long-range nuclear missiles engaged and inbound to your location. Brace for impact in approximately `5` minutes.",
	"Rise and shine… bot, rise and shine",
	"Networking the circuit…\nBypassing the back-end XML transistor…\nEncoding the DHCP pixel…",
	"*Windows XP start-up jingle*",
	"Do not look behind you",
	"Does anybody even read these?",
	"Rule of thumb: Blame Discord API.",
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Displays the Bot and Discord API latency"),
	async execute(interaction, client) {
		let embed = new EmbedBuilder()
			.setTitle("Pinging...")
			.setColor("#5865f2");

		await interaction.reply({ embeds: [embed] }).then(async () => {
			const date = new Date();
			embed
				.setTitle("Pang")
				.setDescription(
					quotes[Math.floor(Math.random() * quotes.length)]
				)
				.addFields(
					{
						name: "Bot Latency",
						value: `\`${(
							date.getTime() - interaction.createdTimestamp
						).toString()} ms\``,
						inline: true,
					},
					{
						name: "API Latency",
						value: `\`${Math.round(
							client.ws.ping
						).toString()} ms\``,
						inline: true,
					}
				);

			interaction.editReply({ embeds: [embed] });
		});
	},
};
