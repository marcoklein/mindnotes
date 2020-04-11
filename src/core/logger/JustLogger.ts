
export enum Level {
    ERROR,
    WARN,
    INFO,
    VERBOSE,
    DEBUG,
    TRACE
}

export type FormatterType = (input: any) => any;

export class Logger {

    label: string;

    private formatters: {[key: string]: FormatterType} = {
        /**
         * Number formatter.
         */
        'i': (input: number) => {
            return input;
        },
        's': (input: string) => {
            return input;
        },
        'j': (input: string) => {
            return JSON.stringify(input);
        }
    }

    constructor(label: string) {
        this.label = label;
    }

    private logWithParams(level: Level, params: any[]) {
        console.log(`${this.label} ${Level[level]}`, this.formatLog(params));
    }

    /**
     * Evaluates log params and creates a new log message.
     * 
     * @param params 
     */
    private formatLog(params: any[]): any {
        if (!params || !params.length) {
            return '';
        }
        if (typeof params[0] === 'string') {
            if (params.length === 1) {
                return params[0];
            }
            let argIndex = 0;
            return params[0].replace(/%([a-zA-Z%])/g, (match, format) => {
                if (match === '%%') {
                    // skip %
                    return match;
                }
                // next parameter
                argIndex++;
                if (argIndex >= params.length) {
                    return match;
                }

                const formatter: Function = this.formatters[format];
                if (typeof formatter === 'function') {
                    match = formatter.call(this, params[argIndex]);
                }

                return match;
            });
        }
        
        return params;
    }

    error(...params: any) {
        this.logWithParams(Level.ERROR, params);
    }
    
    warn(...params: any) {
        this.logWithParams(Level.WARN, params);
    }

    info(...params: any) {
        this.logWithParams(Level.INFO, params);
    }

    verbose(...params: any) {
        this.logWithParams(Level.VERBOSE, params);
    }
    
    debug(...params: any) {
        this.logWithParams(Level.DEBUG, params);
    }

    trace(...params: any) {
        this.logWithParams(Level.TRACE, params);
    }

}
