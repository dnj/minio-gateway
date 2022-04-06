import { Command } from 'commander';
import cliProgress from 'cli-progress';
import Clonner from '../Clonner';
import { setup } from './common';

interface IOptions {
  bucket?: string[];
  progress: boolean;
  prefix?: string;
  after?: string;
}

const command = new Command('clone');
command.description('Clone primary upstream to peers');
command.option('-p, --progress', 'enable progress', true);
command.option('--no-progress', 'disable progress');
command.option('-b, --bucket <names...>', 'Names all bucket you wanted to sync. (Default is all of buckets)');
command.option('--prefix <prefix>', 'Prefix for listing objects in clone process. (Only if you provide bucket name)');
command.option('--after <after>', 'Find only objects after this key in clone process. (Only if you provide bucket name)');

command.action(async (options: IOptions) => {
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
  if ((options.prefix || options.after) && (options.bucket === undefined || options.bucket.length > 1)) {
    console.error("if you want use --prefix or --after use must provide exactly one --bucket");
    return;
  }
  if (options.bucket !== undefined && options.bucket.length === 1) {
    Clonner.startSingle(config, options.bucket[0], bar, options.prefix, options.after);
  } else {
    Clonner.start(config, options.bucket, bar);
  }
});

export default command;
