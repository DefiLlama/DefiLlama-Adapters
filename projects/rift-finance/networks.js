const sdk = require("@defillama/sdk");
module.exports = {
  aurora: {
    coreAddress: "0x40A01A4064b690cA33FA52d315ec02015eF5287E",
    startBlock: 58983267,
    graphUrl:
      sdk.graph.modifyEndpoint('GkqMC7XyPQFceCjT7rdqc62nzfF5WsVCn6HA9q17VBW'),
  },
  ethereum: {
    coreAddress: "0x5D7e616B2c0bf268494A482e315a60814F97dBC8",
    startBlock: 14845882,
    graphUrl:
      sdk.graph.modifyEndpoint('44q7UpeVu33BTDwHd1iHJnEYXwcF9NM6HRd5oSVdLFDQ'),
  },
};
