import { NetworkAdapter } from './AbstractNetworkAdapter';

/**
 * Prototype that tunnels all messages directly to another LocalTransmitter instance.
 */
export class LocalNetworkAdapter extends NetworkAdapter {
  peer: LocalNetworkAdapter | undefined;

  send(message: any): void {
    if (this.peer) {
      this.peer.receive(message);
    }
  }

  receive(message: any) {
    this.listeners.forEach(callback => {
      callback(message);
    });
  }
}
