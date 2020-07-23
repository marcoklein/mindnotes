export type MessageCallback = (msg: any) => void;

export abstract class NetworkAdapter {
  protected listeners: MessageCallback[] = [];

  abstract send(message: any): void;

  addCallback(callback: MessageCallback) {
    this.listeners.push(callback);
  }
}
