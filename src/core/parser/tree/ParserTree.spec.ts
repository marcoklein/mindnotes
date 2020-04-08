import 'mocha';
import { ParserTree } from './ParserTree';
import { expect } from 'chai';


describe('Parser Tree Test', () => {

	let tree = new ParserTree();

	beforeEach(() => {
		tree = new ParserTree();
	});

	it('Should create an empty tree', () => {
		expect(tree.nodesAtLine).to.be.empty;
	});

	describe('Node Inseration', () => {

		it('Should append a new node', () => {
			// given
			const line = 0;
			const indent = 0;

			// when
			const node = tree.addNewParserNode(line, indent, 'rootNode');

			// then
			expect(node.id).to.equal(ParserTree.INITIAL_NODE_ID);
			expect(node.headText).to.equal('rootNode');
			expect(node.indentation).to.equal(indent);
			expect(node.parent).to.be.undefined;
			expect(node.predecessor).to.be.undefined;
			expect(node.successor).to.be.undefined;
			expect(tree.getNodeOfLine(line)).to.equal(node);
			expect(tree.getNodeById(ParserTree.INITIAL_NODE_ID)).to.equal(node);
		});
		
		it('Should append a new sibling', () => {
			// given
			const indent = 0;
			const existing = tree.addNewParserNode(0, indent, 'rootNode');

			// when
			const line = 1;
			const newNode = tree.addNewParserNode(line, indent, 'sibling');

			// then

			// existing
			expect(existing.parent).to.be.undefined;
			expect(existing.predecessor).to.be.undefined;
			expect(existing.successor).to.equal(newNode);
			// node
			expect(newNode.id).to.equal(ParserTree.INITIAL_NODE_ID + 1);
			expect(newNode.headText).to.equal('sibling');
			expect(newNode.indentation).to.equal(indent);
			expect(newNode.parent).to.be.undefined;
			expect(newNode.predecessor).to.equal(existing);
			expect(newNode.successor).to.be.undefined;
			// tree
			expect(tree.getNodeOfLine(0)).to.equal(existing);
			expect(tree.getNodeOfLine(line)).to.equal(newNode);
			expect(tree.getNodeById(ParserTree.INITIAL_NODE_ID + 1)).to.equal(newNode);
		});

		it('Should insert a new line', () => {
			// given
			const indent = 0;

			// when
			const existing = tree.addNewParserNode(0, indent, 'rootNode');
			const third = tree.addNewParserNode(1, indent, 'third');
			tree.insertLine(1);

			// then
			expect(tree.nodesAtLine).to.have.lengthOf(3);
			expect(tree.getNodeOfLine(0)).to.equal(existing);
			expect(tree.getNodeOfLine(1)).to.equal(existing);
			expect(tree.getNodeOfLine(2)).to.equal(third);
		});

		it('Should insert a new sibling', () => {
			// given
			const indent = 0;
			const existing = tree.addNewParserNode(0, indent, 'rootNode');
			tree.insertLine(1);
			const third = tree.addNewParserNode(2, indent, 'third');

			// when
			const line = 1;
			const newNode = tree.addNewParserNode(line, indent, 'sibling');

			// then
			expect(existing.parent).to.be.undefined;
			expect(existing.predecessor).to.be.undefined;
			expect(existing.successor).to.equal(newNode);

			expect(newNode.parent).to.be.undefined;
			expect(newNode.predecessor).to.equal(existing);
			expect(newNode.successor).to.equal(third);
			
			expect(third.parent).to.be.undefined;
			expect(third.predecessor).to.equal(newNode);
			expect(third.successor).to.be.undefined;
		});

		it('Should insert a child', () => {
			// given
			const indent = 2;
			const root = tree.addNewParserNode(0, 0, 'rootNode');
			const childA = tree.addNewParserNode(1, indent, 'childA');
			const childB = tree.addNewParserNode(2, indent + 2, 'childB');
			// rootNode
			//   childA
			//     <insert>
			//     childB

			// when
			const line = 2;
			tree.insertLine(2);
			const newNode = tree.addNewParserNode(line, indent + 2, 'sibling');

			// then
			expect(childA.parent).to.equal(root);
			expect(childA.predecessor).to.be.undefined;
			expect(childA.successor).to.be.undefined;
			
			expect(newNode.parent).to.equal(childA);
			expect(newNode.predecessor).to.be.undefined;
			expect(newNode.successor).to.equal(childB);
			
			expect(childB.parent).to.equal(childA);
			expect(childB.predecessor).to.equal(newNode);
			expect(childB.successor).to.be.undefined;
		});
		
		it('Should insert a parent followed by a child', () => {
			// given
			const root = tree.addNewParserNode(0, 0, 'rootNode');
			const childA = tree.addNewParserNode(1, 2, 'childA');
			const childB = tree.addNewParserNode(2, 2, 'childB');
			// rootNode
			//   childA
			// <insert>
			//   childB

			// when
			const line = 2;
			tree.insertLine(2);
			const newNode = tree.addNewParserNode(line, 0, 'sibling');

			// then
			expect(root.parent).to.be.undefined;
			expect(root.predecessor).to.be.undefined;
			expect(root.successor).to.equal(newNode);

			expect(childA.parent).to.equal(root);
			expect(childA.predecessor).to.be.undefined;
			expect(childA.successor).to.be.undefined;
			
			expect(newNode.parent).to.be.undefined;
			expect(newNode.predecessor).to.equal(root);
			expect(newNode.successor).to.be.undefined;
			
			expect(childB.parent).to.equal(newNode);
			expect(childB.predecessor).to.be.undefined;
			expect(childB.successor).to.be.undefined;
		});
		
		it('Should insert a parent followed by a sibling', () => {
			// given
			const root = tree.addNewParserNode(0, 0, 'rootNode');
			const childA = tree.addNewParserNode(1, 2, 'childA');
			const childB = tree.addNewParserNode(2, 0, 'childB');
			// rootNode
			//   childA
			// <insert>
			// childB

			// when
			const line = 2;
			tree.insertLine(line);
			const newNode = tree.addNewParserNode(line, 0, 'sibling');

			// then
			expect(root.parent).to.be.undefined;
			expect(root.predecessor).to.be.undefined;
			expect(root.successor).to.equal(newNode);

			expect(childA.parent).to.equal(root);
			expect(childA.predecessor).to.be.undefined;
			expect(childA.successor).to.be.undefined;
			
			expect(newNode.parent).to.be.undefined;
			expect(newNode.predecessor).to.equal(root);
			expect(newNode.successor).to.equal(childB);
			
			expect(childB.parent).to.be.undefined;
			expect(childB.predecessor).to.equal(newNode);
			expect(childB.successor).to.be.undefined;
		});

		it('Should insert a parent followed by a sibling with root parent', () => {
			// given
			const parent = tree.addNewParserNode(0, 0, 'parent');
			const root = tree.addNewParserNode(1, 2, 'rootNode');
			const childA = tree.addNewParserNode(2, 4, 'childA');
			const childB = tree.addNewParserNode(3, 2, 'childB');
			// parent
			//   rootNode
			//     childA
			//   <insert>
			//   childB

			// when
			const line = 3;
			tree.insertLine(line);
			const newNode = tree.addNewParserNode(line, 2, 'sibling');

			// then
			expect(root.parent).to.equal(parent);
			expect(root.predecessor).to.be.undefined;
			expect(root.successor).to.equal(newNode);

			expect(childA.parent).to.equal(root);
			expect(childA.predecessor).to.be.undefined;
			expect(childA.successor).to.be.undefined;
			
			expect(newNode.parent).to.equal(parent);
			expect(newNode.predecessor).to.equal(root);
			expect(newNode.successor).to.equal(childB);
			
			expect(childB.parent).to.equal(parent);
			expect(childB.predecessor).to.equal(newNode);
			expect(childB.successor).to.be.undefined;
		});
	});
});
