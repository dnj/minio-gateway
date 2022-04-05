import { Command } from 'commander';
import { container } from 'tsyringe';
import CacheManager from '../CacheManager';
import Server from '../Server';
import { setup } from './common';

const command = new Command('serve');

command.description('Run a reverse-proxy server');
command.action(async () => {
  await setup();
  const cacheManager = container.resolve(CacheManager);
  cacheManager.setupClearInterval();
  const server = container.resolve(Server);
  server.listen();

});

export default command;
