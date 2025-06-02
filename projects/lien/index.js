const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const contracts = [
  "0xE446158503d0F5c70579FCCE774C00E8Db544559", // aggregator1
  "0x5F3b6405dfcF8b21f8dEB4eb6DA44a89a652aCb0", // aggregator2
  "0xCc96397Cb86f98759BdbbF31802b366E7251F350", // aggregator3
  "0xDA6FC5625E617bB92F5359921D43321cEbC6BEf0", // bondmaker
  "0x2f84206b5ED3Eb855C886414f3905115DD166614", // GDOTC
  "0xaB37e1358b639Fd877f015027Bb62d3ddAa7557E", // Lien Token
  "0x54ea75daf8f0c71ef5ac918bd2eda4448e814925", // reserve1
  "0xca18201c57370df5684b7cbad9b1b886e03f198f", // reserve2
  "0x9f6ff467fd6ca8832d9e0eff95c34f4939e7becb", // reserve3
]

module.exports = {
  start: '2021-04-30', // 30/4/2021 @ 04:00PM (UTC)
  ethereum: { tvl: sumTokensExport({ owners: contracts, tokens: [nullAddress]}) }
};
