declare module 'ethers' {
  export namespace ethers {
    class Wallet {
      constructor(privateKey: string);
      readonly address: string;
      readonly publicKey: string;
      readonly privateKey: string;
      signMessage(message: string | Uint8Array): Promise<string>;
      static createRandom(): Wallet;
    }

    function verifyMessage(message: string | Uint8Array, signature: string): string;
    function isAddress(address: string): boolean;
    function hexlify(data: Uint8Array): string;
    function randomBytes(length: number): Uint8Array;

    interface Provider {}
    interface Contract {}
  }
}
