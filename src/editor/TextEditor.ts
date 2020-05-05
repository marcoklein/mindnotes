import * as jsondiffpatch from "jsondiffpatch";
import { NetworkAdapter } from "../core/network/AbstractNetworkAdapter";
import { ParserTree } from "../core/parser/ParserTree";
import { TextParser } from "../core/parser/TextParser";
import { editorLogger } from "../logger";

const log = editorLogger('editor');

export class TextEditor {

    parser = new TextParser();
    textArea: HTMLTextAreaElement;
    network: NetworkAdapter;
    previousTree: ParserTree | undefined = undefined;

    debounceTimer: any;
    
    constructor(network: NetworkAdapter) {
        this.network = network;
        this.textArea = <HTMLTextAreaElement> document.getElementById('textEditor');
        this.init();
        this.triggerContentChange();
    }

    private init() {
        const area = this.textArea;
        
        area.addEventListener('input', (event: any) => {
            log.trace(event);
            log.debug('target %s, selectionStart %i, selectionEnd %i , rows %i', event.data, event.target.selectionStart, event.target.selectionEnd, event.target.rows);

            this.triggerContentChange();

        }, false);
    }

    private triggerContentChange() {
        if (!this.debounceTimer) {
            this.debounceTimer = setTimeout(() => {
                this.debounceTimer = undefined;
                // TODO debounce complete reparsing (setTimeout in new thread)
                const tree = this.parser.parse(this.textArea.value);
        
                // send diff
                log.debug('sending diff state');
                log.debug('cur state %s', JSON.stringify(tree));
                const delta = jsondiffpatch.diff(this.previousTree, tree);
                if (delta) this.network.send(delta);
                this.previousTree = tree;
            }, 100);
        }
    }
}