const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { duration } = require("moment");
const os = require("os");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Displays various stats about the bot"),
	async execute(interaction, client) {
		const embed = new EmbedBuilder()
            .setTitle("Stats")
            .setColor("#5865f2")
            .setTimestamp()
            .addFields([
                // I wanted to use luxon for this, but I just couldn't find a way to "humanize" it
                { name: "Uptime", value: duration(client.uptime).humanize(), inline: true },
                { name: "In Guilds", value: client.guilds.cache.size.toString(), inline: true },
                { name: "Commands Processed", value: "WIP", inline: true },
                { name: "RAM Used", value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                { name: "OS", value: os.version(), inline: true }
            ])
        
        await interaction.reply({ embeds: [embed] })
	},
};
