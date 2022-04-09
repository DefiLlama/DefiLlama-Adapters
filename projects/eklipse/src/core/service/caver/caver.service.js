// eslint-disable-next-line @typescript-eslint/no-var-requires

const Caver = require("caver-js");

class CaverService {
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

module.exports = CaverService 
