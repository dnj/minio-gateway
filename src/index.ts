#!/usr/bin/env node

import { program } from 'commander';
import path from 'path';
import ServeCommand from "./Commands/Serve";

program.option("-c, --config <file>", "Path to config file", path.resolve(__dirname, "..", "config.json"));
program.addCommand(ServeCommand);
program.parse();