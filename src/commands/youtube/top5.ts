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

		const ids = await searchVideos(query, 50, c);
		const videos = await fetchVideos(ids ?? [], c);

		const titles = videos.map((video) => video.snippet?.title ?? '');
		const topFiveTitles = titles.slice(0, 5);

		const embed = new EmbedBuilder()
			.setTitle(`Top 5 Titles for "${query}"`)
			.setDescription(codeBlock(topFiveTitles.join('\n')))
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
		.setName('top5')
		.setDescription("Searchs a term on YouTube and lists the top 5 videos' titles")
		.addStringOption((option) => option.setName('query').setDescription('Search query').setRequired(true)),
	info: { example: '/top5 Hypixel BedWars', usage: '/top5 <query>', category: 'YouTube' }
} satisfies Command;
