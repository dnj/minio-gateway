import { program } from 'commander';
import { container } from 'tsyringe';
import winston from 'winston';
import ConfigRepository, { ILoggingConfig } from '../ConfigRepository';

export async function setupConfig() {
  const config = await ConfigRepository.fromFile(program.getOptionValue('config'));
  container.registerInstance(ConfigRepository, config);

  return config;
}

export function setupLogger() {
  const config = container.resolve(ConfigRepository);
  const loggingConfig = config.getLogging();
  const opts = program.opts() as {
    'logLevel'?: ILoggingConfig['level'],
    'logFile'?: string;
    'verbose'?: boolean;
  };
  if (opts.logLevel !== undefined) {
    loggingConfig.level = opts.logLevel;
  }
  if (opts.logFile !== undefined) {
    loggingConfig.file = opts.logFile;
  }
  if (opts.verbose !== undefined) {
    loggingConfig.console = opts.verbose;
  }

  const transports: winston.transport[] = [];
  if (loggingConfig !== undefined) {
    if (loggingConfig.console) {
      transports.push(new winston.transports.Console());
    }
    if (loggingConfig.file !== undefined) {
      transports.push(new winston.transports.File({ filename: loggingConfig.file }));
    }
  }

  const logger = winston.createLogger({
    transports,
    level: loggingConfig.level,
  });

  container.registerInstance<winston.Logger>('Logger', logger);

  return logger;
}

export async function setup() {
  const config = await setupConfig();
  const logger = setupLogger();
  return { config, logger };
}
