const { sumTokens2, unwrapSlipstreamNFT } = require("../helper/unwrapLPs");

const config = {
  factory: "0xDa14Fdd72345c4d2511357214c5B89A919768e59",
  uniNFT: "0x03a520b32c04bf3beef7beb72e919cf822ed34f1",
  alienBaseNFT: "0xb7996d1ecd07fb227e8dca8cd5214bdfb04534e5",
  slipNFT: "0x827922686190790b37229fd06084350e74485b72",
  wAeroNFT: "0x17B5826382e3a5257b829cF0546A08Bd77409270".toLowerCase(),
  sAeroNFT: "0x9f42361B7602Df1A8Ae28Bf63E6cb1883CD44C27".toLowerCase(),
  sSlipNFT: "0x1Dc7A0f5336F52724B650E39174cfcbbEdD67bF1".toLowerCase(),
  pools: [
    "0x803ea69c7e87D1d6C86adeB40CB636cC0E6B98E2", // wethPool
    "0x3ec4a293Fb906DD2Cd440c20dECB250DeF141dF1", // usdcPool
    "0xa37E9b4369dc20940009030BfbC2088F09645e3B"  // cbbtcPool
  ]
};

async function unwrapArcadiaAeroLP({ api, ownerIds }) {
  const { wAeroNFT, sAeroNFT, sSlipNFT } = config
  const wAERONFTIds = []
  const sAERONFTIds = []
  const sSlipNftIds = []

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
        case sSlipNFT:
          sSlipNftIds.push(ids[i]);
          break;
      }
    }
  }

  const wrappedData = await api.multiCall({ abi: abi.positionState, calls: wAERONFTIds, target: wAeroNFT });
  const stakedData = await api.multiCall({ abi: abi.stakedAeroPositionState, calls: sAERONFTIds, target: sAeroNFT });
  wrappedData.forEach((data) => api.add(data.pool, data.amountWrapped));
  stakedData.forEach((data) => api.add(data.pool, data.amountStaked));

  await uwrapStakedSlipstreamLP({ api, sSlipNftIds });
}

async function uwrapStakedSlipstreamLP({ api, sSlipNftIds, }) {
  const { slipNFT } = config;

  // Arcadia's staked slipstream NFT wrapper issues a position with the same ID as the wrapped NFT
  // -> fetch the values of the wrapped IDs by simply fetching the values of those IDs on the native slipstream NFT
  await unwrapSlipstreamNFT({ api, positionIds: sSlipNftIds, nftAddress: slipNFT, });
}

async function tvl (api) {
  const { factory, pools, uniNFT, slipNFT, wAeroNFT, sAeroNFT, sSlipNFT, alienBaseNFT } = config;
  const ownerTokens = []
  const ownerIds = []
  const accs = []

  const uTokens = await api.multiCall({ abi: "address:asset", calls: pools });
  await api.sumTokens({ blacklistedTokens: [uniNFT, slipNFT, wAeroNFT, sAeroNFT, sSlipNFT, alienBaseNFT], tokensAndOwners2: [uTokens, pools] });
  
  const accounts = await api.fetchList({ lengthAbi: 'allAccountsLength', itemAbi: 'allAccounts', target: factory, })
  const assetDatas = await api.multiCall({ abi: abi.generateAssetData, calls: accounts, permitFailure: true })

  accounts.forEach((account, i) => {
    const assetData = assetDatas[i];
    if (!assetData || !assetData.assets || !assetData.assets.length ) return;
    ownerTokens.push([assetData.assets, account])
    if (!assetData[0].length || !assetData[1].length) return;
    ownerIds.push([assetData[0], assetData[1], account])
    accs.push(account)
  })

  if (alienBaseNFT)
    await sumTokens2({ api, owners: accs, uniV3ExtraConfig: { nftAddress: alienBaseNFT } })

  // add all simple ERC20s
  await api.sumTokens({ ownerTokens, blacklistedTokens: [uniNFT, slipNFT, wAeroNFT, sAeroNFT, sSlipNFT, alienBaseNFT],});

  // add all Arcadia-wrapped LP positions
  await unwrapArcadiaAeroLP({ api, ownerIds });

  // add all native LP positions
  return sumTokens2({ api, owners: accs, resolveUniV3: true, resolveSlipstream: true })
}

module.exports = {
  methodology: "TVL is calculated as the sum of all Account values and the available balance in the liquidity pools. Assets are not double counted.",
  base: { tvl },
  isHeavyProtocol: true,
  start: '2024-03-25', // Mon Mar 25 2024 18:00:00 GMT+0000
  hallmarks: [
    [Math.floor(new Date("2024-04-03") / 1e3), "Points program announced."],
  ],
};

const abi = {
  generateAssetData: 'function generateAssetData() view returns (address[] assets, uint256[], uint256[])',
  positionState: 'function positionState(uint256 tokenId) view returns ((uint128 fee0PerLiquidity, uint128 fee1PerLiquidity, uint128 fee0, uint128 fee1, uint128 amountWrapped, address pool))',
  stakedAeroPositionState: 'function positionState(uint256 tokenId) view returns ((address pool, uint128 amountStaked, uint128 lastRewardPerTokenPosition, uint128 lastRewardPosition))'
}