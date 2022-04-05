import { program } from 'commander';
import { container } from 'tsyringe';
import winston, { format } from 'winston';
import CacheManager from '../CacheManager';
import ConfigRepository, { IConfigMinio, ILoggingConfig } from '../ConfigRepository';
import Upstream from '../Upstream';

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
    format: format.combine(
      format.timestamp(),
      format.json()
    ),
    level: loggingConfig.level,
  });

  container.registerInstance<winston.Logger>('Logger', logger);

  return logger;
}

export function registerUpstreams(): void {
  const cacheManager = container.resolve(CacheManager);
  const register = (name: string, config: IConfigMinio) => {
    const instance = new Upstream(new URL(config.url), config.accessKey, config.secretKey, cacheManager);
    container.registerInstance<Upstream>(name, instance);
  };
  const config = container.resolve(ConfigRepository);
  register("minio", config.getMinio());
  if (config.isSlave()) {
    register("master", config.getMaster() as IConfigMinio);
  }
  for (const slave of config.getSlaves()) {
    register("slave", slave);
  }
}

export async function setup() {
  const config = await setupConfig();
  const logger = setupLogger();
  registerUpstreams();
  return { config, logger };
}
