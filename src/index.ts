import { InteractionResponseType, InteractionType, verifyKey } from 'discord-interactions';
import { Hono } from 'hono';

import { handleApplicationCommandAutocomplete } from './handlers/handleApplicationCommandAutocomplete';
import { handleApplicationCommand } from './handlers/handleApplicationCommand';

import type { Bindings } from './types/Bindings';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
	return c.text('keyword bot made by cxntered 👋');
});

app.post('/', async (c) => {
	const body = await c.req.text();
	const signature = c.req.header('X-Signature-Ed25519') ?? '';
	const timestamp = c.req.header('X-Signature-Timestamp') ?? '';

	const isValidRequest = verifyKey(body, signature, timestamp, c.env.DISCORD_PUBLIC_KEY);

	if (!isValidRequest) {
		console.log('Invalid request signature');
		return c.text('Invalid request signature', 401);
	}

	const interaction = JSON.parse(body);

	if (interaction.type === InteractionType.PING) {
		console.log('Handling ping request');
		return c.json({ type: InteractionResponseType.PONG }, 200);
	} else if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		return await handleApplicationCommand(c, interaction);
	} else if (interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
		return await handleApplicationCommandAutocomplete(c, interaction);
	} else {
		console.log('Unknown interaction type');
		return c.json(
			{
				error: 'Unknown Type'
			},
			400
		);
	}
});

export default app;
