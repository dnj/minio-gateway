import { Command } from 'commander';
import path from 'path';
import ConfigRepository from '../ConfigRepository';
import Server from '../Server';
const command = new Command("serve");

command.description('Run a reverse-proxy server');
command.action(async (options) => {
	try {
		options.config = options.config || path.resolve(__dirname, "..", "..", "config.json");
		const config = await ConfigRepository.fromFile(options.config);
		const server = new Server(config);
		server.listen();
	} catch(e) {
		console.error(e);
	}
});

export default command;