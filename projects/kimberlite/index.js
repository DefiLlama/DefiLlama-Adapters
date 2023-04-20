const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { vestingHelper } = require("../helper/unknownTokens");
const { config } = require('./config')

async function calculateTvl(contract, chain, block) {
  
  const blacklist = [];
  
  const { output: lengths } = await sdk.api.abi.multiCall({
    abi: abi.depositId,
    calls: [{ target: contract }],
    chain, block,
  })
  
  const contractBalance = await getBalances(contract, lengths[0].output);
  Object.entries(contractBalance).forEach(([token, val]) => {
  sdk.util.sumSingleBalance(balances, token, val);
  })

  async function getBalances(vault, length) {
    const calls = []
    for (let i = 1; i <= length; i++)
      calls.push({ target: vault, params: i })
    const { output } = await sdk.api.abi.multiCall({
      abi: abi.lockedToken, requery: true,
      calls, chain, block,
    })
    const tokens = output.map(i => i.output.tokenAddress)
    return vestingHelper({
      useDefaultCoreAssets: true,
      blacklist,
      owner: vault,
      tokens,
      block, chain,
      log_coreAssetPrices: [
        300/ 1e18,
        1/ 1e18,
        1/ 1e18,
        1/ 1e18,
      ],
      log_minTokenValue: 1e6,
    })
  }
};

/* async function getTotalTvl(block) {
  const networks = ['ethereum', 'bsc', 'metis', 'polygon', 'core', 'dogechain', 'arbitrum'];
  const promises = networks.map(async (network) => {
    const tvl = await module.exports[network].tvl(null, null, { [network]: block });
    return tvl;
  });

  const tvlArray = await Promise.all(promises);
  const totalTvl = tvlArray.reduce((accumulator, tvl) => {
    for (const [token, value] of Object.entries(tvl)) {
      sdk.util.sumSingleBalance(accumulator, token, value);
    }
    return accumulator;
  }, {});

  return totalTvl;
} */

module.exports = {
  methodology:
    "Counts TVL of all the tokens locked on the Kimberlite Safe locker smart contracts.",
  //tvl: getTotalTvl,
  ethereum: {
    tvl: async (_, _b, { ethereum: block }) => calculateTvl(config.kimberliteSafeETH.locker, config.kimberliteSafeETH.chain, block)
  },
  bsc: {
    tvl: async (_, _b, { bsc: block }) => calculateTvl(config.kimberliteSafeBSC.locker, config.kimberliteSafeBSC.chain, block)
  },
  metis: {
    tvl: async (_, _b, { metis: block }) => calculateTvl(config.kimberliteSafeMETIS.locker, config.kimberliteSafeMETIS.chain, block)
  },
  polygon: {
    tvl: async (_, _b, { polygon: block }) => calculateTvl(config.kimberliteSafeMATIC.locker, config.kimberliteSafeMATIC.chain, block)
  },
  core: {
    tvl: async (_, _b, { core: block }) => calculateTvl(config.kimberliteSafeCORE.locker, config.kimberliteSafeCORE.chain, block)
  },
  dogechain: {
    tvl: async (_, _b, { dogechain: block }) => calculateTvl(config.kimberliteSafeDOGE.locker, config.kimberliteSafeDOGE.chain, block)
  },
  arbitrum: {
    tvl: async (_, _b, { arbitrum: block }) => calculateTvl(config.kimberliteSafeARB.locker, config.kimberliteSafeARB.chain, block)
  },
}
