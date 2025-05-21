import {
	APIApplicationCommandAutocompleteInteraction,
	APIChatInputApplicationCommandInteraction,
	ApplicationCommandOptionType,
	PermissionFlagsBits
} from 'discord-api-types/v10';
import { SlashCommandBuilder, EmbedBuilder, inlineCode, codeBlock } from '@discordjs/builders';
import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';
import { Context } from 'hono';
import Fuse from 'fuse.js';

import { getCommandMention } from '../../utils/getCommandMention';
import { commands } from '../../constants/commands';
import { errorEmbed } from '../../constants/embeds';
import { colors } from '../../constants/colors';

import type { Command } from '../../types/command';

export default {
	execute: async (c: Context, interaction: APIChatInputApplicationCommandInteraction) => {
		if (
			interaction.data.options?.[0].type === ApplicationCommandOptionType.Subcommand ||
			interaction.data.options?.[0].type === ApplicationCommandOptionType.SubcommandGroup
		) {
			return;
		}

		const commandName = interaction.data.options?.[0].value.toString();

		if (!commandName) {
			const getCategory = async (category: string) => {
				const commandsInCategory = commands.filter(
					(command) => command.info.category === category && command.data.default_member_permissions !== PermissionFlagsBits.Administrator.toString()
				);
				const commandMentions = await Promise.all(commandsInCategory.map(async (command) => await getCommandMention(command, c)));
				return commandMentions.join(', ');
			};

			const embed = new EmbedBuilder()
				.setTitle('Help')
				.setDescription('For more information about a command, use `/help <command>`')
				.addFields(
					{ name: '<:icons_youtube:1186456028498374748> YouTube', value: await getCategory('YouTube') },
					{ name: '<:icons_hammer:1186454117237932052> Utility', value: await getCategory('Utility') },
					{ name: '<:icons_info:1186454560160616589> Info', value: await getCategory('Info') }
				)
				.setColor(colors.default)
				.setFooter({ text: 'Made by cxntered' });

			return c.json({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [embed]
				}
			});
		}

		const command = commands.get(commandName);

		if (!command) {
			return c.json({
				data: {
					embeds: [errorEmbed(`The command ${inlineCode(commandName)} does not exist.`)],
					flags: InteractionResponseFlags.EPHEMERAL
				},
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
			});
		}

		const embed = new EmbedBuilder()
			.setTitle('Help')
			.setDescription(`${await getCommandMention(command, c)} \n${codeBlock(command.data.description)}`)
			.addFields(
				{ value: inlineCode(command.info.category), name: 'Category', inline: true },
				{ value: inlineCode(command.info.usage), name: 'Usage', inline: true },
				{ value: inlineCode(command.info.example), name: 'Example', inline: true }
			)
			.setColor(colors.default)
			.setFooter({ text: '<> - Required, [] - Optional | Made by cxntered' });

		return c.json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [embed]
			}
		});
	},
	autocomplete: async (c: Context, interaction: APIApplicationCommandAutocompleteInteraction) => {
		if (interaction.data.options?.[0].type !== ApplicationCommandOptionType.String) return;

		const focusedValue = interaction.data.options?.[0].value?.toString() ?? '';
		const choices = commands.map((command) => command.data.name);

		if (!focusedValue) {
			return c.json({
				data: {
					choices: choices.sort().map((choice) => ({ value: choice, name: choice }))
				},
				type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT
			});
		}

		const fuse = new Fuse(choices, { threshold: 0.3, keys: ['name'] });
		const filtered = fuse.search(focusedValue).map((result) => result.item);

		return c.json({
			data: {
				choices: filtered.map((choice) => ({ value: choice, name: choice }))
			},
			type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT
		});
	},
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Provides a list of commands or information on a command')
		.addStringOption((option) => option.setName('command').setDescription('The command to get information on.').setAutocomplete(true)),
	info: { example: '/help, /help ping', usage: '/help [command]', category: 'Info' }
} satisfies Command;
