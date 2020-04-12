
const canvas = document.createElement('canvas');
const context = <CanvasRenderingContext2D> canvas.getContext('2d');

export abstract class BrowserUtils {
    private constructor(){};

    /**
     * Measure width of given text before rendering.
     * 
     * @param text Text to measure width of
     * @param fontSize Size of font, e.g. 12
     * @param fontFace Font style e.g. Arial
     */
    static calculateTextWidth(text: string, fontSize: number, fontFace: string = 'Arial') {
        context.font = fontSize + 'px ' + fontFace;
        return context.measureText(text).width;
    }
}

