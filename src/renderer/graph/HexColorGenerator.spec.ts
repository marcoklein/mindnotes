import 'mocha';
import { expect } from 'chai';
import { HexColorGenerator } from './HexColorGenerator';

describe('HexColorGenerator Test', () => {
  let colorGenerator = new HexColorGenerator();

  it('should generate a random hex color', () => {
    // given, when
    Math.random = () => 0.5;
    let hexColor = colorGenerator.generateColor(0, 16, 0, 16, 0, 16);

    // then
    expect(hexColor).to.equal('#888');
  });
  
  it('should generate a random light hex color', () => {
    // given, when
    Math.random = () => 0.01;
    let hexColor = colorGenerator.generateRandomLightColor();

    // then
    expect(hexColor).to.equal('#888');
  });

});
