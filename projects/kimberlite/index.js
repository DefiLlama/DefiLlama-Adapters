const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { vestingHelper } = require("../helper/unknownTokens");

const config = [
  kimberliteSafeETH: {
    chain: "ethereum",
    locker: "0x1492AfF2D39fa5fFBF717DE80B15DCf3311B1BAb", 
    startBlock: 17029807
  },
  kimberliteSafeBSC: {
    chain: "bsc",
    locker: "0xFb22A44FF24D599600A90eea13B14b5662b10353", 
    startBlock: 25521834
  },
  kimberliteSafeMETIS: {
    chain: "metis",
    locker: "0xE4E56E5e234783BCb77A80e19C8B3B5b42588AAb", 
    startBlock: 4228174
  },
  kimberliteSafeCORE: {
    chain: "core",
    locker: "0xCa308C3B5e008148A8665c77073b0335AecF627c", 
    startBlock: 852565
  },
  kimberliteSafeMATIC: {
    chain: "polygon",
    locker: "0xE4E56E5e234783BCb77A80e19C8B3B5b42588AAb", 
    startBlock: 37286221
  },
  kimberliteSafeDOGE: {
    chain: "dogechain",
    locker: "0x1492AfF2D39fa5fFBF717DE80B15DCf3311B1BAb", 
    startBlock: 5552716
  },
  kimberliteSafeARB: {
    chain: "arbitrum",
    locker: "0xE4E56E5e234783BCb77A80e19C8B3B5b42588AAb", 
    startBlock: 49220342
  },
]

async function calculateTvl(contract, chain, block) {
  
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

module.exports = {
  methodology:
    "Counts TVL of all the tokens locked on the Kimberlite Safe locker smart contracts.",
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
