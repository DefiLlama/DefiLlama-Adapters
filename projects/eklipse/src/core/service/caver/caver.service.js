// eslint-disable-next-line @typescript-eslint/no-var-requires

import Caver from "caver-js";

export class CaverService {
  caver;

  constructor() {
    this.caver = new Caver(
      new Caver.providers.HttpProvider("https://public-node-api.klaytnapi.com/v1/cypress"),
    );
  }

  getCaver() {
    return this.caver;
  }

  contract(abi, address) {
    return new this.caver.klay.Contract(abi, address);
  }
}
