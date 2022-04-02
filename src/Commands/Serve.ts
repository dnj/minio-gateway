import { Command } from 'commander';
import Server from '../Server';
import { setup } from './common';

const command = new Command('serve');

command.description('Run a reverse-proxy server');
command.action(async () => {
  const { config } = await setup();
  const server = new Server(config);
  server.listen();
});

export default command;
