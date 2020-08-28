import { expect } from 'chai';
import 'mocha';
import { MindNotesLexer } from './MindNotesLexer';
import {
  LEXEM_EMPTY_LINE,
  LEXEM_NODE_TEXT,
  LEXEM_INDENT,
  LEXEM_MULTILINE_INDICATOR,
  LEXEM_ATTRIBUTE_LIST_START,
  LEXEM_ATTRIBUTE_NAME,
  LEXEM_ATTRIBUTE_ASSIGN,
  LEXEM_ATTRIBUTE_VALUE,
  LEXEM_ATTRIBUTE_LIST_END,
} from './LexemType';

describe('Lexer Test', () => {
  let lexer = new MindNotesLexer();

  it('should create empty lexems', () => {
    // given
    const lines = ['', ' ', '\t', '    \t \t  '];

    // when
    const results = lines.map(lexer.tokenizeLine).map(r => r.lexems);

    // then
    expect(results).to.have.lengthOf(4);
    results.forEach(result => {
      expect(result).to.have.lengthOf(1);
      expect(result[0].type).to.equal(LEXEM_EMPTY_LINE);
    });
    expect(results[0][0].start).to.equal(0);
    expect(results[0][0].end).to.equal(0);
    expect(results[1][0].start).to.equal(0);
    expect(results[1][0].end).to.equal(1);
    expect(results[2][0].start).to.equal(0);
    expect(results[2][0].end).to.equal(1);
    expect(results[3][0].start).to.equal(0);
    expect(results[3][0].end).to.equal(9);
  });

  it('should return node text with (optional) indentation', () => {
    // given
    const lines = ['node   ', ' node', '\tnode  ', '    \t \t  node   '];

    // when
    const results = lines.map(lexer.tokenizeLine).map(r => r.lexems);

    // then
    // 'node   '
    expect(results).to.have.lengthOf(4);
    expect(results[0][0]).to.include({
      type: LEXEM_NODE_TEXT,
      start: 0,
      end: 7,
      content: 'node   ',
    });
    // ' node'
    expect(results[1]).to.have.deep.members([
      {
        type: LEXEM_INDENT,
        start: 0,
        end: 1,
        content: ' ',
      },
      {
        type: LEXEM_NODE_TEXT,
        start: 1,
        end: 5,
        content: 'node',
      },
    ]);
    // '\tnode  '
    expect(results[2]).to.have.deep.members([
      {
        type: LEXEM_INDENT,
        start: 0,
        end: 1,
        content: '\t',
      },
      {
        type: LEXEM_NODE_TEXT,
        start: 1,
        end: 7,
        content: 'node  ',
      },
    ]);
    // '    \t \t  node   '
    expect(results[3]).to.have.deep.members([
      {
        type: LEXEM_INDENT,
        start: 0,
        end: 9,
        content: '    \t \t  ',
      },
      {
        type: LEXEM_NODE_TEXT,
        start: 9,
        end: 16,
        content: 'node   ',
      },
    ]);
  });

  it('should return the multiline tag', () => {
    // given
    const lines = ['+node   ', ' + node', ' +', '+ ', '+'];

    // when
    const results = lines.map(lexer.tokenizeLine).map(r => r.lexems);

    // then
    expect(results).to.have.lengthOf(5);
    expect(results[0]).to.have.deep.members([
      {
        type: LEXEM_MULTILINE_INDICATOR,
        start: 0,
        end: 1,
        content: '+',
      },
      {
        type: LEXEM_NODE_TEXT,
        start: 1,
        end: 8,
        content: 'node   ',
      },
    ]);
    // ' + node'
    expect(results[1]).to.have.deep.members([
      {
        type: LEXEM_INDENT,
        start: 0,
        end: 1,
        content: ' ',
      },
      {
        type: LEXEM_MULTILINE_INDICATOR,
        start: 1,
        end: 2,
        content: '+',
      },
      {
        type: LEXEM_NODE_TEXT,
        start: 3,
        end: 7,
        content: 'node',
      },
    ]);
    // ' +'
    expect(results[2]).to.have.deep.members([
      {
        type: LEXEM_INDENT,
        start: 0,
        end: 1,
        content: ' ',
      },
      {
        type: LEXEM_MULTILINE_INDICATOR,
        start: 1,
        end: 2,
        content: '+',
      },
    ]);
    // '+ '
    expect(results[3]).to.have.deep.members([
      {
        type: LEXEM_MULTILINE_INDICATOR,
        start: 0,
        end: 1,
        content: '+',
      },
    ]);
    // '+'
    expect(results[4]).to.have.deep.members([
      {
        type: LEXEM_MULTILINE_INDICATOR,
        start: 0,
        end: 1,
        content: '+',
      },
    ]);
  });

  it('should return properties', () => {
    // given
    const lines = ['(prop=val)'];

    // when
    const results = lines.map(lexer.tokenizeLine).map(r => r.lexems);

    // then
    expect(results[0]).to.have.deep.members([
      {
        type: LEXEM_ATTRIBUTE_LIST_START,
        start: 0,
        end: 1,
        content: '(',
      },
      {
        type: LEXEM_ATTRIBUTE_NAME,
        start: 1,
        end: 5,
        content: 'prop',
      },
      {
        type: LEXEM_ATTRIBUTE_ASSIGN,
        start: 5,
        end: 6,
        content: '=',
      },
      {
        type: LEXEM_ATTRIBUTE_VALUE,
        start: 6,
        end: 9,
        content: 'val',
      },
      {
        type: LEXEM_ATTRIBUTE_LIST_END,
        start: 9,
        end: 10,
        content: ')',
      },
    ]);
  });

  it('should return multiple properties', () => {
    // given
    const lines = ['(prop=val, prop2 = val2)'];

    // when
    const results = lines.map(lexer.tokenizeLine).map(r => r.lexems);

    // then
    expect(results[0]).to.have.deep.members([
      {
        type: LEXEM_ATTRIBUTE_LIST_START,
        start: 0,
        end: 1,
        content: '(',
      },
      {
        type: LEXEM_ATTRIBUTE_NAME,
        start: 1,
        end: 5,
        content: 'prop',
      },
      {
        type: LEXEM_ATTRIBUTE_ASSIGN,
        start: 5,
        end: 6,
        content: '=',
      },
      {
        type: LEXEM_ATTRIBUTE_VALUE,
        start: 6,
        end: 9,
        content: 'val',
      },
      {
        type: LEXEM_ATTRIBUTE_NAME,
        start: 11,
        end: 16,
        content: 'prop2',
      },
      {
        type: LEXEM_ATTRIBUTE_ASSIGN,
        start: 17,
        end: 18,
        content: '=',
      },
      {
        type: LEXEM_ATTRIBUTE_VALUE,
        start: 19,
        end: 23,
        content: 'val2',
      },
      {
        type: LEXEM_ATTRIBUTE_LIST_END,
        start: 23,
        end: 24,
        content: ')',
      },
    ]);
  });
});
