import { type APIChatInputApplicationCommandInteraction, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { SlashCommandBuilder, EmbedBuilder, codeBlock } from '@discordjs/builders';
import { InteractionResponseType } from 'discord-interactions';
import { Context } from 'hono';

import { colors } from '../../constants/colors';

import type { Bindings } from '../../types/bindings';
import type { Command } from '../../types/command';

export default {
	async execute(c: Context<{ Bindings: Bindings }>, interaction: APIChatInputApplicationCommandInteraction) {
		const subcommand = interaction.data.options?.find((option) => option.type === ApplicationCommandOptionType.Subcommand)?.name;

		if (subcommand === 'list') {
			const excludedWords = (await c.env.KEYWORD_BOT.get('excludedWords')) ?? '';

			const embed = new EmbedBuilder()
				.setTitle('Excluded Words')
				.setDescription(excludedWords.length > 0 ? codeBlock(excludedWords.split(',').join(', ')) : codeBlock('There are no excluded words.'))
				.setColor(colors.default)
				.setFooter({ text: '(automatically excluded: links, special characters, numbers less than 10)' });

			return c.json({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					embeds: [embed]
				}
			});
		} else if (subcommand === 'add') {
			const option = interaction.data.options?.find((option) => option.name === 'add');
			if (!option || option.type !== ApplicationCommandOptionType.Subcommand) return;

			const words = option.options
				?.find((option) => option.name === 'words')
				?.value.toString()
				.split(' ')
				.map((word: string) => word.trim().replaceAll(',', ''))
				.filter((value: string, index: number, array: string[]) => array.indexOf(value) === index) as string[];

			await c.env.KEYWORD_BOT.put('excludedWords', words.toString());

			const embed = new EmbedBuilder()
				.setTitle('Excluded Words')
				.setDescription(codeBlock(words.join(', ')))
				.setColor(colors.default)
				.setFooter({ text: '(automatically excluded: links, special characters, numbers less than 10)' });

			return c.json({
				data: {
					content: 'Sucessfully added words to the excluded words list.',
					embeds: [embed]
				},
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
			});
		} else if (subcommand === 'remove') {
			const option = interaction.data.options?.find((option) => option.name === 'remove');
			if (!option || option.type !== ApplicationCommandOptionType.Subcommand) return;

			const words = option.options
				?.find((option) => option.name === 'words')
				?.value.toString()
				.split(' ')
				.map((word: string) => word.trim().replaceAll(',', ''))
				.filter((value: string, index: number, array: string[]) => array.indexOf(value) === index) as string[];

			const excludedWords = ((await c.env.KEYWORD_BOT.get('excludedWords'))?.split(',') ?? []) as string[];
			const newExcludedWords = excludedWords.filter((word) => !words.includes(word));

			await c.env.KEYWORD_BOT.put('excludedWords', newExcludedWords.toString());

			const embed = new EmbedBuilder()
				.setTitle('Excluded Words')
				.setDescription(newExcludedWords.length > 0 ? codeBlock(newExcludedWords.join(', ')) : codeBlock('There are no excluded words.'))
				.setColor(colors.default)
				.setFooter({ text: '(automatically excluded: links, special characters, numbers less than 10)' });

			return c.json({
				data: {
					content: 'Sucessfully removed words from the excluded words list.',
					embeds: [embed]
				},
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
			});
		}
	},
	data: new SlashCommandBuilder()
		.setName('excludedwords')
		.setDescription('List, add, or remove excluded words')
		.addSubcommand((subcommand) => subcommand.setName('list').setDescription('List all excluded words'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add')
				.setDescription('Add a word to the excluded words list.')
				.addStringOption((option) =>
					option.setName('words').setDescription('Words to add to the excluded words list. Separate words with spaces').setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('remove')
				.setDescription('Remove a word from the excluded words list.')
				.addStringOption((option) =>
					option.setName('words').setDescription('Words to remove from the excluded words list. Separate words with spaces').setRequired(true)
				)
		),
	info: { usage: '/excludedwords <list/add/remove>', example: '/excludedwords list', category: 'Utility' }
} satisfies Command;
