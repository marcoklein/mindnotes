import { SerializedEventEmitter } from "../core/events/EventHandler";
import { editorLogger } from "../logger";
import { TextParser } from "../core/parser/TextParser";

const log = editorLogger('editor');


document.addEventListener('selectionchange', () => {
    console.log('on selection change');
});

export class TextEditor {

    parser = new TextParser();
    textArea: HTMLTextAreaElement;
    events: SerializedEventEmitter;
    
    constructor(events: SerializedEventEmitter) {
        this.events = events;
        this.textArea = <HTMLTextAreaElement> document.getElementById('textEditor');
        this.init();
    }

    private init() {
        const area = this.textArea;

        area.addEventListener('change', (change: any) => {
            log.trace('selection change');
            console.log(change);
            log.debug('selectionStart %i, selectionEnd %i', area.selectionStart, area.selectionEnd);
        }, false);

        
        // document.onselectionchange = () => {
        //     console.log('selection change: ', document.getSelection());
        // }
        area.addEventListener('input', (event: any) => {
            log.trace(event);
            log.debug('target %s, selectionStart %i, selectionEnd %i , rows %i', event.data, event.target.selectionStart, event.target.selectionEnd, event.target.rows);

            // debounce complete reparsing (setTimeout in new thread)
            // TODO do parsing
            // this.parser.parse(area.value)
            // this.parser.parse(area.value).events.forEach(event => {
            //     this.events.emit(event);
            // })
        }, false);
    }
}