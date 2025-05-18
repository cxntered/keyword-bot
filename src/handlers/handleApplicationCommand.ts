import { APIChatInputApplicationCommandInteraction, ApplicationCommandOptionType, Snowflake } from 'discord-api-types/v10';
import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';
import { Collection } from '@discordjs/collection';
import { Context } from 'hono';

import { cooldownEmbed, errorEmbed } from '../constants/embeds';
import { getCommandMention } from '../utils/getCommandMention';
import { commands } from '../constants/commands';

const cooldowns: Collection<string, Collection<Snowflake, number>> = new Collection();

export const handleApplicationCommand = async (c: Context, interaction: APIChatInputApplicationCommandInteraction) => {
	const command = commands.get(interaction.data.name.toLowerCase());
	const subcommand = interaction.data.options?.find((option) => option.type === ApplicationCommandOptionType.Subcommand)?.name;

	if (!command) {
		console.log('Unknown command');
		return c.json(
			{
				error: 'Unknown Type'
			},
			400
		);
	}

	if (!cooldowns.has(command.data.name)) {
		cooldowns.set(command.data.name, new Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.data.name);
	const cooldownAmount = (command.cooldown ?? 5) * 1000;

	if (timestamps?.has(interaction.user?.id ?? '')) {
		const expirationTime = (timestamps.get(interaction.user?.id ?? '') ?? 5) + cooldownAmount;

		if (now < expirationTime) {
			const expirationTimestamp = Math.round(expirationTime / 1000);

			return c.json({
				data: { embeds: [cooldownEmbed(expirationTimestamp, await getCommandMention(command, c, subcommand))], flags: InteractionResponseFlags.EPHEMERAL },
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
			});
		}
	}

	timestamps?.set(interaction.user?.id ?? '', now);
	setTimeout(() => timestamps?.delete(interaction.user?.id ?? ''), cooldownAmount);

	try {
		return command.execute(c, interaction);
	} catch (err) {
		console.error('Something went wrong while trying to execute a command.');
		console.error(err);

		return c.json({
			data: {
				flags: InteractionResponseFlags.EPHEMERAL,
				embeds: [errorEmbed()]
			},
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
		});
	}
};
