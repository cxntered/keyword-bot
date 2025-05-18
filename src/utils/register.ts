import dotenv from 'dotenv';

import { commands } from '../constants/commands.js';

dotenv.config({ path: '.dev.vars' });

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token) {
	throw new Error('The DISCORD_TOKEN environment variable is required.');
} else if (!applicationId) {
	throw new Error('The DISCORD_APPLICATION_ID environment variable is required.');
}

const commandsData = [...commands.values()].map((command) => command.data);

const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;

const response = await fetch(url, {
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bot ${token}`
	},
	body: JSON.stringify(commandsData),
	method: 'PUT'
});

if (response.ok) {
	console.log('Successfully registered commands.');
	const data = await response.json();
	console.log(JSON.stringify(data, null, 4));
} else {
	console.error('Failed to register commands.');
	let errorText = `Error registering commands \n ${response.url}: ${response.status} ${response.statusText}`;
	try {
		const error = await response.text();
		if (error) {
			errorText = `${errorText} \n\n ${error}`;
		}
	} catch (err) {
		console.error('Error reading body from request:', err);
	}
	console.error(errorText);
}
