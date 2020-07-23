import { coreLogger } from '../../logger';

/**
 * Creates a new logger with the provided label.
 *
 * @param label
 */
export const parserLogger = (label: string) => {
  return coreLogger('parser.' + label);
};
