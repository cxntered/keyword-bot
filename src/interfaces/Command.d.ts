import { APIApplicationCommandAutocompleteInteraction, APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { SlashCommandSubcommandsOnlyBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { TypedResponse, Context } from 'hono';

export interface Command {
	autocomplete?: (
		c: Context,
		interaction: APIApplicationCommandAutocompleteInteraction
	) => Promise<(TypedResponse & Response) | undefined> | Promise<Response> | Response;
	execute: (
		c: Context,
		interaction: APIChatInputApplicationCommandInteraction
	) => Promise<(TypedResponse & Response) | undefined> | Promise<Response> | Response;
	data: Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'> | SlashCommandSubcommandsOnlyBuilder | SlashCommandBuilder;
	info: {
		category: string;
		example: string;
		usage: string;
	};
	cooldown?: number;
}
