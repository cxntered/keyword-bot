import { type APIChatInputApplicationCommandInteraction, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { SlashCommandBuilder, EmbedBuilder, codeBlock, bold } from '@discordjs/builders';
import { InteractionResponseType } from 'discord-interactions';
import { Context } from 'hono';

import { searchVideos } from '../../utils/youtubeApi';
import { colors } from '../../constants/colors';

import type { youtube_v3 } from '@googleapis/youtube';

import type { Bindings } from '../../types/bindings';
import type { Command } from '../../types/command';

export default {
	execute: async (c: Context<{ Bindings: Bindings }>, interaction: APIChatInputApplicationCommandInteraction) => {
		const subcommand = interaction.data.options?.find((option) => option.type === ApplicationCommandOptionType.Subcommand);
		if (subcommand?.type !== ApplicationCommandOptionType.Subcommand) return;

		const query = subcommand?.options?.find((option) => option.name === 'query')?.value?.toString() ?? '';

		const findKeywords = async (metadata: string[], tags: string[]): Promise<string[]> => {
			const excludedWords = ((await c.env.KEYWORD_BOT.get('excludedWords'))?.split(',') ?? []) as string[];

			if (subcommand.name === 'tags') {
				const tagCount: { [key: string]: number } = {};

				tags.forEach((tag) => {
					if (!excludedWords.includes(tag) && !(Number(tag) < 10)) {
						tagCount[tag] = (tagCount[tag] || 0) + 1;
					}
				});

				const sortedTags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
				let joinedTags = sortedTags.join(', ');

				while (joinedTags.length > 500) {
					sortedTags.pop();
					joinedTags = sortedTags.join(', ');
				}

				return sortedTags;
			} else {
				const words: string[] = metadata
					.join(' ')
					.toLowerCase()
					.replaceAll(/(?:https?):\/\/[\S]+/g, '')
					.split(/[^a-zA-Z0-9]+/);
				const wordCount: { [key: string]: number } = {};

				words.forEach((word) => {
					if (!excludedWords.includes(word) && !(Number(word) < 10)) {
						wordCount[word] = (wordCount[word] || 0) + 1;
					}
				});

				const sortedWords = Object.keys(wordCount).sort((a, b) => wordCount[b] - wordCount[a]);

				return sortedWords.slice(0, 50);
			}
		};

		const videos = await searchVideos(query, 20, c);
		const videoMetadata = videos.map((video: youtube_v3.Schema$Video) => `${video.snippet?.title} ${video.snippet?.description}`);
		const videoTags = videos.flatMap((video: youtube_v3.Schema$Video) => video.snippet?.tags?.map((tag) => tag.toLowerCase()) ?? []);
		const keywords = await findKeywords(videoMetadata, videoTags);

		const typeName = subcommand.name === 'metadata' ? 'Metadata (Titles & Descriptions)' : 'Video Tags';

		const embed = new EmbedBuilder()
			.setTitle(`Keywords for "${query}"`)
			.setDescription(`<:icons_edit:1186513811621032016> ${bold('Type:')} ${typeName} \n${codeBlock(keywords.join(', '))}`)
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
		.setName('keywords')
		.setDescription('Searches a term on YouTube and scans through video metadata or video tags to find keywords')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('metadata')
				.setDescription('Searches through titles and descriptions to find keywords')
				.addStringOption((option) => option.setName('query').setDescription('Search query').setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('tags')
				.setDescription('Searches through video tags to find keywords')
				.addStringOption((option) => option.setName('query').setDescription('Search query').setRequired(true))
		),
	info: { example: '/keywords metadata Hypixel BedWars', usage: '/keywords <metadata/tags> <query>', category: 'YouTube' }
} satisfies Command;
