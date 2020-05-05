import 'mocha';
import { expect } from 'chai';
import { ParserTreeBuilder } from './ParserTreeBuilder';
import { ParserTree } from './ParserTree';


describe('ParserTreeBuilder Test', () => {

    let builder = new ParserTreeBuilder();
    beforeEach(() => {
        builder = new ParserTreeBuilder();
    });

    it('should create a parser tree', () => {
        // given
        builder.pushChild(0, 'rootNode');
        builder.pushChild(1, 'childA');
        builder.pushChild(2, 'childB');
        builder.popToIndent(0);
        builder.pushSibling(0, 'sibling');

        const expectedResult: ParserTree = {
            indentation: -1,
            attributes: {},
            children: [
                {
                    indentation: 0,
                    attributes: {
                        text: 'rootNode',
                    },
                    children: [
                        {
                            indentation: 1,
                            attributes: {
                                text: 'childA',
                            },
                            children: [
                                {
                                    indentation: 2,
                                    attributes: {
                                        text: 'childB',
                                    },
                                    children: [],
                                    errors: [],
                                },],
                            errors: [],
                        },],
                    errors: [],
                },
                {
                    indentation: 0,
                    attributes: {
                        text: 'sibling',
                    },
                    children: [],
                    errors: [],
                },
            ],
            errors: [],
        };

        // when
        const result = builder.build();

        // then
        expect(result).to.deep.equal(expectedResult);
    });

});
