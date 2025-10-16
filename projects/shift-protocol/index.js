const { getProvider } = require("@defillama/sdk/build/general");
const { Contract, formatUnits } = require("ethers");
const abi = require("./ShiftTvlFeed.json");
const contractsByChain = require("./config");

function getChainTvlFunction(chain) {
  return async function tvl(_, _block, _chainBlocks) {
    const provider = getProvider(chain);
    let totalTvl = 0;

    for (const address of contractsByChain[chain]) {
      const contract = new Contract(address, abi, provider);
      const [tvlData, decimals] = await Promise.all([
        contract.getLastTvl(),
        contract.decimals()
      ]);

      const tvlValue = parseFloat(formatUnits(tvlData.value, decimals));
      totalTvl += tvlValue;
    }

    return {
      usd: totalTvl
    };
  };
}

const adapter = {
  methodology: "TVL is calculated as the aggregated amount of USDC deposited across all of Shift's vault, inclusive of losses or gains."
};

for (const chain of Object.keys(contractsByChain)) {
  adapter[chain] = {
    tvl: getChainTvlFunction(chain)
  };
}

module.exports = adapter;