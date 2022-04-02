import { Command } from 'commander';
import cliProgress from 'cli-progress';
import Clonner from '../Clonner';
import { setup } from './common';

const command = new Command('clone');

command.description('Clone primary upstream to peers');
command.option('-p, --progress', 'enable progress', true);
command.option('--no-progress', 'disable progress');
command.option('-b, --bucket <names...>', 'Names all bucket you wanted to sync. (Default is all of buckets)');
command.action(async (options: { bucket?: string[], progress: boolean }) => {
  const { config } = await setup();

  let bar: cliProgress.SingleBar | undefined;
  if (options.progress) {
    bar = new cliProgress.SingleBar({
      noTTYOutput: true,
      format: 'progress [{bar}] {percentage}% | ETA: {eta}s | {workers} Workers | {value}/{total}',
      formatValue: (v, options, type) => {
        if (v > 0 && (type === 'total' || type === 'value')) {
          const i = Math.floor(Math.log(v) / Math.log(1024));
          return `${(v / 1024 ** i).toFixed(2)} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
        }
        return cliProgress.Format.ValueFormat(v, options, type);
      },

    });
  }

  Clonner.start(config, options.bucket, bar);
});

export default command;
