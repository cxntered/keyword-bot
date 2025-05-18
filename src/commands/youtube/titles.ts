import { type APIChatInputApplicationCommandInteraction, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { SlashCommandBuilder, EmbedBuilder, codeBlock } from '@discordjs/builders';
import { InteractionResponseType } from 'discord-interactions';
import { Context } from 'hono';

import { searchVideos, fetchVideos } from '../../utils/youtubeApi.js';
import { colors } from '../../constants/colors.js';

import type { Command } from '../../interfaces/Command.js';

export default {
	execute: async (c: Context, interaction: APIChatInputApplicationCommandInteraction) => {
		if (interaction.data.options?.[0].type !== ApplicationCommandOptionType.String) return;
		const query = interaction.data.options?.[0].value.toString();

		const findKeywords = async (titles: string[]): Promise<string[]> => {
			const words: string[] = titles
				.join(' ')
				.toLowerCase()
				.split(/[^a-zA-Z0-9]+/);
			const wordCount: { [key: string]: number } = {};

			words.forEach((word) => {
				wordCount[word] = (wordCount[word] || 0) + 1;
			});

			const sortedWords = Object.keys(wordCount).sort((a, b) => wordCount[b] - wordCount[a]);

			return sortedWords.slice(0, 30);
		};

		const ids = await searchVideos(query, 50, c);
		const videos = await fetchVideos(ids ?? [], c);

		const titles = videos.map((video) => video.snippet?.title ?? '');
		const keywords = await findKeywords(titles);

		const embed = new EmbedBuilder()
			.setTitle(`Keywords for "${query}"`)
			.setDescription(codeBlock(keywords.join(', ')))
			.setColor(colors.default)
			.setFooter({ text: '(sorted by frequency) | Made by cxntered' });

		return c.json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [embed]
			}
		});
	},
	data: new SlashCommandBuilder()
		.setName('titles')
		.setDescription('Searches a term on YouTube and scans through only titles to find keywords')
		.addStringOption((option) => option.setName('query').setDescription('Search query').setRequired(true)),
	info: { example: '/titles Hypixel BedWars', usage: '/titles <query>', category: 'YouTube' }
} satisfies Command;
