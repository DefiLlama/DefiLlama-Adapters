const { sumTokens2, } = require("../helper/unwrapLPs");

const config = {
  base: {
    factory: "0xDa14Fdd72345c4d2511357214c5B89A919768e59",
    pools: {
      wethPool: "0x803ea69c7e87D1d6C86adeB40CB636cC0E6B98E2",
      usdcPool: "0x3ec4a293Fb906DD2Cd440c20dECB250DeF141dF1",
    },
    uniNFT: "0x03a520b32c04bf3beef7beb72e919cf822ed34f1",
    slipNFT: "0x827922686190790b37229fd06084350e74485b72",
    wAeroNFT: "0x17B5826382e3a5257b829cF0546A08Bd77409270".toLowerCase(),
    sAeroNFT: "0x9f42361B7602Df1A8Ae28Bf63E6cb1883CD44C27".toLowerCase(),
  },
};

async function unwrapArcadiaAeroLP({ api, ownerIds, }) {
  const { wAeroNFT, sAeroNFT } = config[api.chain]
  const wAERONFTIds = []
  const sAERONFTIds = []

  // for each asset address owned by an account
  // check if the asset is the wrapped or staked aero asset module
  // if so, fetch the amount of lp wrapped or staked
  // create object with aerodrome v1 (=univ2) lp tokens
  for (const ownerId of ownerIds) {
    const [nftAddresses, ids] = ownerId;
    for (let i = 0; i < nftAddresses.length; i++) {
      const nftAddress = nftAddresses[i].toLowerCase()
      switch (nftAddress) {
        case wAeroNFT:
          wAERONFTIds.push(ids[i]);
          break;
        case sAeroNFT:
          sAERONFTIds.push(ids[i]);
          break;
      }
    }
  }

  const wrappedData = await api.multiCall({ abi: abi.wrappedAeroPositionState, calls: wAERONFTIds, target: wAeroNFT, });
  const stakedData = await api.multiCall({ abi: abi.stakedAeroPositionState, calls: sAERONFTIds, target: sAeroNFT, });
  wrappedData.forEach((data) => api.add(data.pool, data.amountWrapped));
  stakedData.forEach((data) => api.add(data.pool, data.amountStaked));
}

async function tvl(api) {
  let { factory, pools, uniNFT, slipNFT, wAeroNFT, sAeroNFT } =
    config[api.chain];
  pools = Object.values(pools);
  const uTokens = await api.multiCall({ abi: "address:asset", calls: pools });
  await api.sumTokens({ tokensAndOwners2: [uTokens, pools] });
  const accounts = await api.fetchList({ lengthAbi: 'allAccountsLength', itemAbi: 'allAccounts', target: factory, });

  const assetData = await api.multiCall({ abi: abi.assetData, calls: accounts, });
  const ownerTokens = accounts.map((account, i) => [assetData[i].assets, account])
  const ownerIds = accounts.map((account, i) => [
    assetData[i][0],
    assetData[i][1],
    account,
  ]);
  await api.sumTokens({ ownerTokens, blacklistedTokens: [uniNFT, slipNFT, wAeroNFT, sAeroNFT], });

  await unwrapArcadiaAeroLP({ api, ownerIds });

  return sumTokens2({ api, owners: accounts, resolveUniV3: true, resolveSlipstream: true })
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
  assetData:
    "function generateAssetData() view returns (address[] assets, uint256[], uint256[])",
  wrappedAeroPositionState:
    "function positionState(uint256 tokenId) view returns ((uint128 fee0PerLiquidity, uint128 fee1PerLiquidity, uint128 fee0, uint128 fee1, uint128 amountWrapped, address pool))",
  stakedAeroPositionState:
    "function positionState(uint256 tokenId) view returns ((address pool, uint128 amountStaked, uint128 lastRewardPerTokenPosition, uint128 lastRewardPosition))",
};
