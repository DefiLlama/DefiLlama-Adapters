const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  base: {
    factory: "0xDa14Fdd72345c4d2511357214c5B89A919768e59",
    pools: {
      wethPool: "0x803ea69c7e87D1d6C86adeB40CB636cC0E6B98E2",
      usdcPool: "0x3ec4a293Fb906DD2Cd440c20dECB250DeF141dF1",
    },
    uniNFT: '0x03a520b32c04bf3beef7beb72e919cf822ed34f1',
  },
}

async function tvl(api) {
  let { factory, pools, uniNFT, } = config[api.chain];
  pools = Object.values(pools);
  const uTokens = await api.multiCall({ abi: "address:asset", calls: pools })
  await api.sumTokens({ tokensAndOwners2: [uTokens, pools] })
  const accounts = await api.fetchList({ lengthAbi: 'allAccountsLength', itemAbi: 'allAccounts', target: factory, });

  const assetData = await api.multiCall({ abi: abi.assetData, calls: accounts, });
  const ownerTokens = accounts.map((account, i) => [assetData[i].assets, account])
  await api.sumTokens({ ownerTokens, blacklistedTokens: [uniNFT] })
  return sumTokens2({ api, owners: accounts, resolveUniV3: true })
}

module.exports = {
  methodology:
    "TVL is calculated as the sum of all Account values and the available balance in the liquidity pools. Assets are not double counted.",
  base: { tvl },
  start: 1711389600, // Mon Mar 25 2024 18:00:00 GMT+0000
  hallmarks: [
    [Math.floor(new Date("2024-04-03") / 1e3), "Points program announced."],
  ],
};

const abi = {
  "assetData": "function generateAssetData() view returns (address[] assets, uint256[], uint256[])",
}