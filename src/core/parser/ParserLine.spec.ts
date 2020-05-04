import 'mocha';
import { ParserLine } from './ParserLine';
import { ParserTree } from './ParserTree';
import * as sinon from 'ts-sinon';

describe('ParserLine Test', () => {

    let tree: sinon.StubbedInstance<ParserTree> = sinon.stubConstructor(ParserTree);
	let line = new ParserLine(tree, undefined, undefined);

	beforeEach(() => {
        tree = sinon.stubConstructor(ParserTree);
        line = new ParserLine(tree, undefined, undefined);
        //tree.insertLine.returns('bla');
    });

});
