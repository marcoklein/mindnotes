import 'mocha';
import { TextParser } from './TextParser';
import { expect } from 'chai';
import { ParserTree } from './ParserTree';
import { ParserTreeBuilder } from './ParserTreeBuilder';



describe('TextParser Test', () => {

    describe('Basic Parsing', () => {
        let parser = new TextParser();
        beforeEach(() => {
            parser = new TextParser();
        });

        it('should parse the root node', () => {
            // given
            const lines = [
                'rootNode',
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);

            // then
            const expectedResult: ParserTree = {
                indentation: -1,
                attributes: {},
                children: [
                    {
                        indentation: 0,
                        attributes: {
                            text: 'rootNode',
                        },
                        children: [],
                        errors: [],
                    },
                ],
                errors: [],
            };
            expect(result).to.deep.equal(expectedResult);
        });
        
        it('should indent multiple children', () => {
            // given
            const lines = [
                'rootNode',
                '  childA',
                '    childB',
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);

            // then
            const expectedResult: ParserTree = new ParserTreeBuilder()
                .pushChild(0, 'rootNode')
                .pushChild(2, 'childA')
                .pushChild(4, 'childB').build();
            expect(result).to.deep.equal(expectedResult);
        });
        
        it('should add multiple root siblings', () => {
            // given
            const lines = [
                'rootNode',
                'siblingA',
                'siblingB',
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);

            // then
            const builder = new ParserTreeBuilder();
            builder.pushChild(0, 'rootNode');
            builder.pushSibling(0, 'siblingA');
            builder.pushSibling(0, 'siblingB');
            expect(result).to.deep.equal( builder.build());
        });
        
        it('should indent and dedent multiple children', () => {
            // given
            const lines = [
                'rootNode',
                '  childA',
                'childB',
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);

            // then
            const builder = new ParserTreeBuilder();
            builder.pushChild(0, 'rootNode');
            builder.pushChild(2, 'childA');
            builder.popToIndent(0);
            builder.pushSibling(0, 'childB');
            expect(result).to.deep.equal( builder.build());
        });

        it('should dedent multiple nodes', () => {
            // given
            const lines = [
                'rootNode',
                ' childA',
                '  childB',
                'sibling',
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);

            // then
            const builder = new ParserTreeBuilder();
            builder.pushChild(0, 'rootNode');
            builder.pushChild(1, 'childA');
            builder.pushChild(2, 'childB');
            builder.popToIndent(0);
            builder.pushSibling(0, 'sibling');
            expect(result).to.deep.equal(builder.build());
        });
    });

    
    describe('JSON Diff', () => {
        let parser = new TextParser();
        beforeEach(() => {
            parser = new TextParser();
        });

        it('should dedent multiple nodes', () => {
            // given
            const lines = [
                'rootNode',
                ' childA',
                '  childB',
                'sibling',
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);

            // then
            const builder = new ParserTreeBuilder();
            builder.pushChild(0, 'rootNode');
            builder.pushChild(1, 'childA');
            builder.pushChild(2, 'childB');
            builder.popToIndent(0);
            builder.pushSibling(0, 'sibling');
            expect(result).to.deep.equal( builder.build());
        });
    });


});
