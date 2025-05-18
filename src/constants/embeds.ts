import { EmbedBuilder, time } from '@discordjs/builders';

import { colors } from './colors.js';

/**
 * Returns an EmbedBuilder for an error message
 * @param {string} message - The message in the error embed, defaults to 'An unexpected error occurred while executing this command.'
 * @returns {EmbedBuilder} - The error embed
 */
export const errorEmbed = (message: string = 'An unexpected error occurred while executing this command.'): EmbedBuilder => {
	return new EmbedBuilder().setTitle('Error').setDescription(message).setColor(colors.error).setFooter({ text: 'Made by cxntered' });
};

/**
 * Returns an EmbedBuilder for an active cooldown message
 * @param {number} expirationTimestamp - The timestamp when the cooldown expires
 * @param {string} command - The command which is on cooldown
 * @returns {EmbedBuilder} - The cooldown embed
 */
export const cooldownEmbed = (expirationTimestamp: number, command: string): EmbedBuilder => {
	return new EmbedBuilder()
		.setTitle('Active Cooldown')
		.setDescription(`Please wait before using the ${command} command again. You can use it again ${time(expirationTimestamp, 'R')}.`)
		.setThumbnail('https://i.imgur.com/8eDWkm5.gif')
		.setColor(colors.cooldown)
		.setFooter({ text: 'Made by cxntered' });
};
