import { ApplicationCommandOptionType, APIApplicationCommand } from 'discord-api-types/v10';
import { chatInputApplicationCommandMention } from '@discordjs/builders';
import { Context } from 'hono';

import type { Command } from '../types/command';
import type { Bindings } from '../types/bindings';

export const getCommandMention = async (command: Command, c: Context<{ Bindings: Bindings }>, subcommandName?: undefined | string) => {
	const url = `https://discord.com/api/v10/applications/${c.env.DISCORD_APPLICATION_ID}/commands`;
	const commands = (await fetch(url, {
		headers: {
			Authorization: `Bot ${c.env.DISCORD_TOKEN}`,
			'Content-Type': 'application/json'
		}
	}).then((res) => res.json())) as APIApplicationCommand[];

	const commandName = command.data.name;
	const id = commands.find((c) => c.name === commandName)?.id;

	const subcommand = command.data.options.map((opt) => {
		const option = opt;

		if (option.toJSON().type === ApplicationCommandOptionType.Subcommand) {
			return option.toJSON().name;
		}
	});

	if (subcommand.length !== 0 && !subcommand.every((e) => e === undefined)) {
		const subcommandMention = subcommand
			.filter((subcommand) => !subcommandName || subcommand === subcommandName)
			.map((subcommand) => chatInputApplicationCommandMention(commandName, subcommand ?? '', id ?? ''));
		return subcommandMention.join(', ');
	}

	const commandMention = chatInputApplicationCommandMention(commandName, id ?? '');

	return commandMention;
};
