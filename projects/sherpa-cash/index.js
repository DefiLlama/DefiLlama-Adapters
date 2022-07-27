const sdk = require("@defillama/sdk");
const { getChainTransform } = require("../helper/portedTokens");

const ETHSherpaContracts = [
  "0x6ceB170e3ec0fAfaE3Be5A02FEFb81F524FE85C5",
  "0x7CE57f6a5a135eb1a8e9640Af1eff9665ade00D9",
  "0xe1376DeF383D1656f5a40B6ba31F8C035BFc26Aa",
];
const WAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";

function getNativeTVL(contractAddresses, chain, token) {
  return async function (timestamp, block, chainBlocks) {
    const balances = {};
    const chainTransform = await getChainTransform(chain);

    for (const contract of contractAddresses) {
      const result = (
        await sdk.api.eth.getBalance({
          target: contract,
          block: chainBlocks[chain],
          chain: chain,
        })
      ).output;

      sdk.util.sumSingleBalance(balances, chainTransform(token), result);
    }

    return balances;
  };
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "TVL consists of the sum of the balances of the Sherpa Cash privacy pools.",
  avax: {
    tvl: getNativeTVL(ETHSherpaContracts, "avax", WAVAX),
  },
};
