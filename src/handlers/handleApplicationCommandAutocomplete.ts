import { APIApplicationCommandAutocompleteInteraction } from 'discord-api-types/v10';
import { Context } from 'hono';

import { commands } from '../constants/commands';

export const handleApplicationCommandAutocomplete = async (c: Context, interaction: APIApplicationCommandAutocompleteInteraction) => {
	const command = commands.get(interaction.data.name.toLowerCase());

	if (!command) {
		console.log('Unknown command');
		return c.json(
			{
				error: 'Unknown Type'
			},
			400
		);
	}

	try {
		return command.autocomplete?.(c, interaction);
	} catch (err) {
		console.error('Something went wrong while trying to execute a command.');
		console.error(err);
	}
};
