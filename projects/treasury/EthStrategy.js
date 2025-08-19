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
      const OWNERS = [
        "0xC53CCed6332D06972A7eaEDc64FDF6d4aF5220b8", // ETH Strategy Main
        "0x75eFa088E34DA03966a5D2b84fA16C77fF25Adfa", // Puttable Warrant (4200 ETH)
        "0xF89f49e21A2Bd1fb24332462cB21dc1378aA25e1", // Staking Multisig
      ];

      const treasuryModule = treasuryExports({
        ethereum: {
          owners: OWNERS,
          tokens: [nullAddress], // native ETH only
          ownTokens: ["0x14cF922aa1512Adfc34409b63e18D391e4a86A2f"],         // no protocol token to separate
        },
      });

      }
    }
  }
};
