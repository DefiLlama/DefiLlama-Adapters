// projects/treasury/your-protocol.js
const { nullAddress, treasuryExports } = require("../helper/treasury")

const OWNERS = [
  "0xC53CCed6332D06972A7eaEDc64FDF6d4aF5220b8", // ETH Strategy Main
  "0x75eFa088E34DA03966a5D2b84fA16C77fF25Adfa", // Puttable Warrant (4200 ETH)
  "0xF89f49e21A2Bd1fb24332462cB21dc1378aA25e1", // Staking Multisig
  "0x9371352CCef6f5b36EfDFE90942fFE622Ab77F1D", // Derive Vault contract 
]

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const treasuryModule = treasuryExports({
        ethereum: {
          owners: OWNERS,
          tokens: [nullAddress, "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110", "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8", "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", "0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"], // native ETH only
          ownTokens: ["0x14cF922aa1512Adfc34409b63e18D391e4a86A2f"],         // no protocol token to separate
        },
      });
      return treasuryModule.ethereum.tvl(api);
    }
  }
};
