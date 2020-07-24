export class HexColorGenerator {
  generateColor(minR: number, maxR: number, minB: number, maxB: number, minG: number, maxG: number) {
    return (
      '#' +
      this.randomHexDigit(minR, maxR) +
      this.randomHexDigit(minB, maxB) +
      this.randomHexDigit(minG, maxG)
    );
  }

  generateRandomLightColor() {
      return this.generateColor(8, 16, 8, 16, 8, 16);
  }

  private randomHexDigit(min: number, max: number) {
    return (Math.floor(Math.random() * (max - min)) + min).toString(16);
  }
}
