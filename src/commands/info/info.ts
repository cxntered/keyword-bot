import { SlashCommandBuilder, EmbedBuilder, inlineCode, hyperlink, bold } from '@discordjs/builders';
import { InteractionResponseType } from 'discord-interactions';
import { Context } from 'hono';

import { colors } from '../../constants/colors';

import type { Command } from '../../types/command';

export default {
	execute: async (c: Context) => {
		const embed = new EmbedBuilder()
			.setTitle('Info')
			.setDescription(
				`Keyword Bot is a bot to search a term on YouTube and scan through video metadata and video tags to find keywords. \n\n<:icons_owner:1186191360290717716> ${bold(
					'Owner:'
				)} ${inlineCode('@cxntered')} (${hyperlink(inlineCode('Website'), 'https://cxntered.dev')})`
			)
			.setColor(colors.default)
			.setThumbnail(
				'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/YouTube_social_white_square_%282017%29.svg/2048px-YouTube_social_white_square_%282017%29.svg.png'
			)
			.setFooter({ text: 'Made by cxntered' });

		return c.json({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				embeds: [embed]
			}
		});
	},
	data: new SlashCommandBuilder().setName('info').setDescription('Shows you info about Keyword Bot'),
	info: { category: 'Info', example: '/info', usage: '/info' }
} satisfies Command;
