import * as winston from 'winston';

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.printf(p => `${p.timestamp} [${p.service}.${p.label}] ${p.level}: ${p.message}`)
    ),
    defaultMeta: { service: 'parser' },
    transports: [
        new winston.transports.Console()
    ]
});

/**
 * Creates a new logger with the provided label.
 * 
 * @param label 
 */
export const PARSER_LOGGER = (label: string) => {
    return logger.child({label});
};