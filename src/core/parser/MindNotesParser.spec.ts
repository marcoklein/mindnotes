import { expect } from 'chai';
import 'mocha';
import { MindNotesParser } from './MindNotesParser';
import { AddNodeEvent, EditNodeEvent, DeleteNodeEvent } from '../events/EventTypes';



describe('Parser Test', () => {

    describe('Add Nodes', () => {

        let parser: MindNotesParser;

        beforeEach(() => {
            parser = new MindNotesParser();
        });

        it('Should add a parent node', () => {
            // given
            const lines = [
                'rootNode',
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);
            const events = result.events;
            const errors = result.errors;

            // then
            expect(content).to.equal('rootNode');
            expect(events).to.have.lengthOf(1);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.members(
                [<AddNodeEvent> {name: AddNodeEvent.NAME, id: 1, parentId: undefined, text: "rootNode"}]
            );
        });
            
        it('Should add a parent node after empty lines', () => {
            // given
            const lines = [
                '',
                '',
                'rootNode',
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(1);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.members(
                [<AddNodeEvent> {name: AddNodeEvent.NAME, id: 1, parentId: undefined, text: "rootNode"}]
            );
        });

        it('Should add a sibling node to the root node', () => {
            // given
            const lines = [
                'rootNode',
                'sibling'
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(2);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.members(
                [
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 1, parentId: undefined, text: "rootNode"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 2, parentId: undefined, text: "sibling"}
                ]
            );
        });

        it('Should add a child to the root node', () => {
            // given
            const lines = [
                'rootNode',
                '  child'
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(2);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.members(
                [
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 1, parentId: undefined, text: "rootNode"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 2, parentId: 1, text: "child"}
                ]
            );
        });

        it('Should add multiple children and siblings', () => {
            // given
            const lines = [
                'rootNode',
                '  childA',
                '    childC',
                '      childD',
                'rootSibling',
                '  childE'
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(6);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.members(
                [
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 1, parentId: undefined, text: "rootNode"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 2, parentId: 1, text: "childA"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 3, parentId: 2, text: "childC"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 4, parentId: 3, text: "childD"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 5, parentId: undefined, text: "rootSibling"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 6, parentId: 5, text: "childE"}
                ]
            );
        });

        it('Should add multiple children and siblings with empty lines', () => {
            // given
            const lines = [
                '',
                'rootNode',
                '',
                '',
                '  childA',
                '',
                '',
                '    childC',
                '',
                '      childD',
                '',
                'rootSibling',
                '',
                '  childE',
                ''
            ];
            const content = lines.join('\n');

            // when
            const result = parser.parse(content);
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(6);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.members(
                [
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 1, parentId: undefined, text: "rootNode"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 2, parentId: 1, text: "childA"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 3, parentId: 2, text: "childC"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 4, parentId: 3, text: "childD"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 5, parentId: undefined, text: "rootSibling"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 6, parentId: 5, text: "childE"}
                ]
            );
            expect(parser.textLines).to.have.ordered.members(lines);
        });
        
    });

    describe('Edit Text', () => {

        let parser = new MindNotesParser();

        it('Should add new lines for empty first text', () => {
            // given
            const lines = [
                'rootNode',
                'secondRootNode'
            ];
            const content = lines.join('\n');

            // when
            const result = parser.edit(0, 0, 0, 0, content);
            const events = result.events;
            const errors = result.errors;

            // then
            expect(parser.textLines).to.have.lengthOf(2);
            expect(parser.textLines).to.have.ordered.members(lines);
        });

        it('Should replace text in the first line', () => {
            // when
            const result = parser.edit(0, 0, 0, 4, 'replaced');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(parser.textLines).to.have.lengthOf(2);
            expect(parser.textLines).to.have.ordered.members([
                'replacedNode',
                'secondRootNode'
            ]);
        });

        it('Should replace multiple lines', () => {
            // when
            const result = parser.edit(0, 0, 1, 14, 'newContent');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(parser.textLines).to.have.lengthOf(1);
            expect(parser.textLines).to.have.ordered.members([
                'newContent'
            ]);
        });

        it('Should replace multiple lines', () => {
            // when
            const result = parser.edit(0, 0, 0, 10, 'rootNode\nrootSibling');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(parser.textLines).to.have.lengthOf(2);
            expect(parser.textLines).to.have.ordered.members([
                'rootNode',
                'rootSibling'
            ]);
        });
        
        it('Should insert a new line', () => {
            // when
            const result = parser.edit(0, 8, 0, 8, '\ntest');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(parser.textLines).to.have.lengthOf(3);
            expect(parser.textLines).to.have.ordered.members([
                'rootNode',
                'test',
                'rootSibling'
            ]);
        });

        it('Should insert multiple lines', () => {
            // when
            const result = parser.edit(0, 8, 0, 8, '\ninsertA\nsecond\nthird');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(parser.textLines).to.have.lengthOf(6);
            expect(parser.textLines).to.have.ordered.members([
                'rootNode',
                'insertA',
                'second',
                'third',
                'test',
                'rootSibling'
            ]);
        });

        it('Should insert line in between', () => {
            // when
            const result = parser.edit(1, 3, 2, 3, 'Node\nasd');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(parser.textLines).to.have.lengthOf(6);
            expect(parser.textLines).to.have.ordered.members([
                'rootNode',
                'insNode',
                'asdond',
                'third',
                'test',
                'rootSibling'
            ]);
        });

        it('Should squash lines', () => {
            // when
            parser.edit(0, 0, 5, 11, 'override');

            // then
            expect(parser.textLines).to.have.lengthOf(1);
            expect(parser.textLines).to.have.ordered.members([
                'override',
            ]);
        });

        it('Should add whitespace to the beginning', () => {
            // when
            parser.edit(0, 0, 0, 0, '  ');

            // then
            expect(parser.textLines).to.have.lengthOf(1);
            expect(parser.textLines).to.have.ordered.members([
                '  override',
            ]);
        });

        it('Should handle a complex change', () => {
            // given
            const existingLines = [
                '',
                'rootNode',
                '',
                '',
                '  childA',
                '',
                '',
                '    childC',
                '',
                '      childD',
                '',
                'rootSibling',
                '',
                '  childE',
                ''
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);
            
            const change = [
                'parentNode',
                '',
                '  insertedChild',
                '    anotherChild',
                '',
                'updatedRoot',
            ];

            // when
            parser.edit(1, 0, 11, 11, change.join('\n'));

            // then
            expect(parser.textLines).to.have.ordered.members([
                '',
                'parentNode',
                '',
                '  insertedChild',
                '    anotherChild',
                '',
                'updatedRoot',
                '',
                '  childE',
                ''
            ]);
        });
        
        it('Should replace bottom two', () => {
            // given
            const existingLines = [
                'rootNode',
                '  childA',
                '  childB'
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);

            // when
            parser.edit(0, 8, 2, 8, '\n  childC\n  childD');

            // then
            expect(parser.textLines).to.have.ordered.members([
                'rootNode',
                '  childC',
                '  childD'
            ]);
        });
    });

    describe('Edit Nodes Events', () => {

        let parser: MindNotesParser;

        beforeEach(() => {
            parser = new MindNotesParser();
        });

        it('Should create two add node events', () => {
            // given
            const lines = [
                'rootNode',
                'secondRootNode'
            ];
            const content = lines.join('\n');

            // when
            const result = parser.edit(0, 0, 0, 0, content);
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(2);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.ordered.members(
                [
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 1, parentId: undefined, text: "rootNode"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 2, parentId: undefined, text: "secondRootNode"},
                ]
            );
        });
        
        it('Should create a child', () => {
            // given
            const existingLines = [
                'rootNode'
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);

            // when
            const result = parser.edit(0, 8, 0, 8, '\n  child');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(1);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.ordered.members(
                [
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 2, parentId: 1, text: "child"},
                ]
            );
        });

        it('Should edit existing node', () => {
            // given
            const existingLines = [
                'rootNode'
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);

            // when
            const result = parser.edit(0, 0, 0, 4, 'super');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(1);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.ordered.members(
                [
                    <EditNodeEvent> {name: EditNodeEvent.NAME, id: 1, parentId: undefined, text: "superNode"},
                ]
            );
        });

        it('Should delete an existing node', () => {
            // given
            const existingLines = [
                'rootNode',
                'sibling',
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);

            // when
            const result = parser.edit(1, 0, 1, 7, '');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(1);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.ordered.members(
                [
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 2},
                ]
            );
        });

        it('Should delete an existing node if the line is removed', () => {
            // given
            const existingLines = [
                'rootNode',
                'sibling',
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);

            // when
            const result = parser.edit(0, 8, 1, 7, '');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(1);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.ordered.members(
                [
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 2},
                ]
            );
        });

        it('Should change the parent node', () => {
            // given
            const existingLines = [
                'rootNode',
                'childA'
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);

            // when
            const result = parser.edit(1, 0, 1, 0, '  ');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(1);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.ordered.members(
                [
                    <EditNodeEvent> {name: EditNodeEvent.NAME, id: 2, parentId: 1, text: "childA"},
                ]
            );
        });

        it('Should delete the first child', () => {
            // given
            const existingLines = [
                'rootNode',
                '  childA',
                '  childB'
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);

            // when
            const result = parser.edit(0, 8, 1, 8, '\n  childC\n  childD');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(events).to.have.lengthOf(2);
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.ordered.members(
                [
                    <EditNodeEvent> {name: EditNodeEvent.NAME, id: 2, parentId: 1, text: "childC"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 4, parentId: 1, text: "childD"},
                ]
            );
        });

        it('Should delete everything', () => {
            // given
            const existingLines = [
                'rootNode',
                '  childA',
                '    childB',
                'rootSibling',
                '  anotherChild',
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);

            // when
            const result = parser.edit(0, 0, 4, 14, '');
            const events = result.events;
            const errors = result.errors;

            // then
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.ordered.members(
                [
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 1},
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 2},
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 3},
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 4},
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 5},
                ]
            );
        });

        
        it('Should handle a complex change', () => {
            // given
            const existingLines = [
                '',
                'rootNode', // 1
                '',
                '',
                '  childA', // 2
                '',
                '',
                '    childC', // 3
                '',
                '      childD', // 4
                '',
                'rootSibling', // 5
                '',
                '  childE', // 6
                ''
            ];
            const existingContent = existingLines.join('\n');
            parser.parse(existingContent);
            
            const change = [
                'parentNode',
                '',
                '  insertedChild',
                '    anotherChild',
                '',
                'updatedRoot',
            ];

            // when
            const result = parser.edit(1, 0, 11, 11, change.join('\n'));
            const events = result.events;
            const errors = result.errors;

            // then
            expect(errors.length).to.equal(0);
            expect(events).to.have.deep.ordered.members(
                [
                    <EditNodeEvent> {name: EditNodeEvent.NAME, id: 1, parentId: undefined, text: "parentNode"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 7, parentId: 1, text: "insertedChild"},
                    <EditNodeEvent> {name: EditNodeEvent.NAME, id: 2, parentId: 7, text: "childA"}, // first the parentId is updated
                    <EditNodeEvent> {name: EditNodeEvent.NAME, id: 2, parentId: 7, text: "anotherChild"},
                    <AddNodeEvent> {name: AddNodeEvent.NAME, id: 8, parentId: undefined, text: "updatedRoot"},
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 3},
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 4},
                    <DeleteNodeEvent> {name: DeleteNodeEvent.NAME, id: 5},
                ]
            );
        });
    });

});
