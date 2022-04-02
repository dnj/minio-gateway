import { program, Option } from 'commander';
import * as path from 'path';
import ServeCommand from './Serve';
import CloneCommand from './Clone';

program.addOption(new Option('-c, --config <file>', 'Path to config file').env('MINIOGATEWAY_CONFIG').default(path.resolve(__dirname, '..', '..', 'config.json')));
program.addOption(new Option('--log-level <level>', 'Level of verbosity of logs').env('MINIOGATEWAY_LOG_LEVEL').choices(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']));
program.addOption(new Option('--log-file <file>', 'Path to log file').env('MINIOGATEWAY_LOG_FILE'));
program.addOption(new Option('-v, --verbose', 'Show the logs').env('MINIOGATEWAY_VERBOSE'));
program.addCommand(ServeCommand);
program.addCommand(CloneCommand);

export default program;
