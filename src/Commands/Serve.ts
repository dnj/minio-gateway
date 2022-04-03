import { Command } from 'commander';
import { container } from 'tsyringe';
import Server from '../Server';
import { setup } from './common';

const command = new Command('serve');

command.description('Run a reverse-proxy server');
command.action(async () => {
  await setup();
  const server = container.resolve(Server);
  server.listen();
});

export default command;
