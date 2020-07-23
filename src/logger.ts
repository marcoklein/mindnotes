import { Logger } from './core/logger/JustLogger';

// const logger = winston.createLogger({
//     level: 'debug',
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.timestamp(),
//         winston.format.splat(),
//         winston.format.printf(p => `${p.timestamp} [${p.label}] ${p.level}: ${p.message}`)
//     ),
//     transports: [
//         new winston.transports.Console()
//     ]
// });

/**
 * Creates a new logger with the provided label.
 *
 * @param label
 */
const attachLogger = (label: string) => {
  // log.getContext().namespace = label;
  return new Logger(label);
  // return log.child({label});
};

export const coreLogger = (label: string) => {
  return attachLogger('core.' + label);
};
export const rendererLogger = (label: string) => {
  return attachLogger('renderer.' + label);
};
export const editorLogger = (label: string) => {
  return attachLogger('editor.' + label);
};
