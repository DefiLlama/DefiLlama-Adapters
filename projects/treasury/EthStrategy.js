const ADDRESSES = require('../helper/coreAssets.json')
// projects/treasury/your-protocol.js
const { nullAddress, treasuryExports } = require("../helper/treasury")

const OWNERS = [
  "0xC53CCed6332D06972A7eaEDc64FDF6d4aF5220b8", // ETH Strategy Main
  "0x75eFa088E34DA03966a5D2b84fA16C77fF25Adfa", // Puttable Warrant (4200 ETH)
  "0xF89f49e21A2Bd1fb24332462cB21dc1378aA25e1", // Staking Multisig
]

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const treasuryModule = treasuryExports({
        ethereum: {
          owners: OWNERS,
          tokens: [nullAddress, ADDRESSES.linea.rzETH, "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8", ADDRESSES.ethereum.STETH, "0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549",ADDRESSES.ethereum.WETH,"0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3","0x04c154b66cb340f3ae24111cc767e0184ed00cc6"], // native ETH only
          ownTokens: ["0x14cF922aa1512Adfc34409b63e18D391e4a86A2f"],         // no protocol token to separate
        },
      });
      return treasuryModule.ethereum.tvl(api);
    }
  }
};
