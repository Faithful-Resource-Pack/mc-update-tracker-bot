// yeah, this isn't an actual error handler, but I didn't know what else to name this

const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

exports.sendErrorMessage = async (client, error, source) => {
	const embed = new EmbedBuilder()
		.setTitle(`Error in ${source || "unknown"}`)
		.setDescription(`\`\`\`${error}\`\`\``)
		.setTimestamp();

	const errorFile = new AttachmentBuilder(Buffer.from(error.stack, "utf8"), {
		name: "error.txt",
	});

	await client.channels.cache
		.get(process.env.ERROR_CHANNEL)
		.send({ embeds: [embed], files: [errorFile] });
};
