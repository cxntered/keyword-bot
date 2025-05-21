import { Collection } from '@discordjs/collection';

import excludedwords from '../commands/utility/excludedwords';
import keywords from '../commands/youtube/keywords';
import titles from '../commands/youtube/titles';
import top5 from '../commands/youtube/top5';
import help from '../commands/info/help';
import info from '../commands/info/info';

import type { Command } from '../types/command';

const commandModules = [keywords, titles, top5, help, info, excludedwords];

export const commands: Collection<string, Command> = new Collection();

commandModules.forEach((command) => {
	commands.set(command.data.name, command);
});
