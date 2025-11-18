import { Logger } from '@nestjs/common';
import chalk from 'chalk';

// Save original methods
const originalLog = Logger.prototype.log;
const originalWarn = Logger.prototype.warn;
const originalError = Logger.prototype.error;
const originalDebug = Logger.prototype.debug;
const originalVerbose = Logger.prototype.verbose;

// // Patch methods
// Logger.prototype.log = function (message: any, context?: string) {
//   originalLog.call(this, chalk.green(message), context);
// };

// Logger.prototype.warn = function (message: any, context?: string) {
//   originalWarn.call(this, chalk.yellow(message), context);
// };

// Logger.prototype.error = function (message: any, trace?: string, context?: string) {
//   originalError.call(this, chalk.red(message), trace, context);
// };

// Logger.prototype.debug = function (message: any, context?: string) {
//   originalDebug.call(this, chalk.blue(message), context);
// };

// Logger.prototype.verbose = function (message: any, context?: string) {
//   originalVerbose.call(this, chalk.cyan(message), context);
// };
