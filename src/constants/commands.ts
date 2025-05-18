import { Collection } from '@discordjs/collection';

import excludedwords from '../commands/utility/excludedwords.js';
import keywords from '../commands/youtube/keywords.js';
import titles from '../commands/youtube/titles.js';
import top5 from '../commands/youtube/top5.js';
import help from '../commands/info/help.js';
import info from '../commands/info/info.js';

import type { Command } from '../interfaces/Command';

const commandModules = [keywords, titles, top5, help, info, excludedwords];

export const commands: Collection<string, Command> = new Collection();

commandModules.forEach((command) => {
	commands.set(command.data.name, command);
});
