const { sumTokens2, unwrapSlipstreamNFT } = require("../helper/unwrapLPs");
const utils = require('../helper/utils')

const config = {
  factory: "0xDa14Fdd72345c4d2511357214c5B89A919768e59",
  uniNFT: "0x03a520b32c04bf3beef7beb72e919cf822ed34f1",
  uniV4NFT: "0x7C5f5A4bBd8fD63184577525326123B519429bDc",
  alienBaseNFT: "0xb7996d1ecd07fb227e8dca8cd5214bdfb04534e5",
  slipNFT: "0x827922686190790b37229fd06084350e74485b72",
  slipV2NFT: "0xa990C6a764b73BF43cee5Bb40339c3322FB9D55F",
  wAeroNFT: "0x17B5826382e3a5257b829cF0546A08Bd77409270".toLowerCase(),
  sAeroNFT: "0x9f42361B7602Df1A8Ae28Bf63E6cb1883CD44C27".toLowerCase(),
  sSlipNFT: "0x1Dc7A0f5336F52724B650E39174cfcbbEdD67bF1".toLowerCase(),
  sSlipV2NFT: "0xBed6C3E35B9B1e044b3Bc71465769EdFDC0FDD4c".toLowerCase(),
  wsSlipNFT: "0xD74339e0F10fcE96894916B93E5Cc7dE89C98272".toLowerCase(),
  wsSlipV2NFT: "0x147a2ccbaf4521ad209a2875ae0b3c496f4b25a4".toLowerCase(),
  pools: [
    "0x803ea69c7e87D1d6C86adeB40CB636cC0E6B98E2", // wethPool
    "0x3ec4a293Fb906DD2Cd440c20dECB250DeF141dF1", // usdcPool
    "0xa37E9b4369dc20940009030BfbC2088F09645e3B"  // cbbtcPool
  ]
};

async function unwrapArcadiaAeroLP({ api, ownerIds }) {
  const { wAeroNFT, sAeroNFT, sSlipNFT, sSlipV2NFT, wsSlipNFT, wsSlipV2NFT, slipNFT, slipV2NFT } = config
  const wAERONFTIds = []
  const sAERONFTIds = []
  const sSlipNftIds = []
  const sSlipV2NftIds = []

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
        case sSlipV2NFT:
          sSlipV2NftIds.push(ids[i]);
          break;
        case wsSlipNFT:
          sSlipNftIds.push(ids[i]);
          break;
        case wsSlipV2NFT:
          sSlipV2NftIds.push(ids[i]);
          break;
      }
    }
  }

  const wrappedData = await api.multiCall({ abi: abi.positionState, calls: wAERONFTIds, target: wAeroNFT });
  const stakedData = await api.multiCall({ abi: abi.stakedAeroPositionState, calls: sAERONFTIds, target: sAeroNFT });
  wrappedData.forEach((data) => api.add(data.pool, data.amountWrapped));
  stakedData.forEach((data) => api.add(data.pool, data.amountStaked));

  await uwrapStakedSlipstreamLP({ api, sSlipNftIds, nft: slipNFT });
  await uwrapStakedSlipstreamLP({ api, sSlipV2NftIds, nft: slipV2NFT });
}

async function uwrapStakedSlipstreamLP({ api, sSlipNftIds, nft, }) {

  // Arcadia's staked slipstream NFT wrapper issues a position with the same ID as the wrapped NFT
  // -> fetch the values of the wrapped IDs by simply fetching the values of those IDs on the native slipstream NFT
  await unwrapSlipstreamNFT({ api, positionIds: sSlipNftIds, nftAddress: nft, });
}

async function tvl (api) {
  const { factory, pools, uniNFT, uniV4NFT, slipNFT, slipV2NFT, wAeroNFT, sAeroNFT, sSlipNFT, sSlipV2NFT, alienBaseNFT, wsSlipNFT, wsSlipV2NFT } = config;
  const ownerTokens = []
  const ownerIds = []
  const accs = []
  const uniV4Ids = []

  const uTokens = await api.multiCall({ abi: "address:asset", calls: pools });
  await api.sumTokens({ blacklistedTokens: [uniNFT, uniV4NFT, slipNFT, slipV2NFT, wAeroNFT, sAeroNFT, sSlipNFT, sSlipV2NFT, alienBaseNFT, wsSlipNFT, wsSlipV2NFT], tokensAndOwners2: [uTokens, pools] });

  const accounts = await api.fetchList({ lengthAbi: 'allAccountsLength', itemAbi: 'allAccounts', target: factory, })

  // Account version 1 has a stored state of all assets, and can be fetched using generateAssetData()
  // Account version 2 has no such stored state, and must be fetched with external api calls.
  const versions = await api.multiCall({abi: 'function ACCOUNT_VERSION() view returns (uint256)', calls: accounts,});
  const v1Accounts = accounts.filter((_, i) => versions[i] === '1' || versions[i] === '3');
  const v2Accounts = accounts.filter((_, i) => versions[i] === '2' || versions[i] === '4');

  // This endpoint uses the following logic:
  // 1. Uses batches of all v2Accounts (to prevent rate limiting)
  // 2. calls Arcadia's endpoint to fetch the asset data of a V2 account
  // 3. verifies onchain that the ownership of the NFTs is indeed correct
  // 4. Return format is then transformed to be identical to the format of the V1 assetData

  const addressesPerRequest = 5;
  const parallelRequests = 25;
  const accountsPerBatch = addressesPerRequest * parallelRequests;

  for (let i = 0; i < v2Accounts.length; i += accountsPerBatch) {
    const batchAccounts = v2Accounts.slice(i, i + accountsPerBatch);

    // Create sub-batches of 5 addresses each
    const requestBatches = [];
    for (let j = 0; j < batchAccounts.length; j += addressesPerRequest) {
      requestBatches.push(batchAccounts.slice(j, j + addressesPerRequest));
    }

    await Promise.all(requestBatches.map(async (accountGroup) => {
      try {
        const addressParams = accountGroup.map(addr => `account_addresses=${addr}`).join('&');
        const assetDataCall = await utils.fetchURL(`https://api.arcadia.finance/v1/api/accounts/spot_asset_data?${addressParams}&chain_id=8453`);

        // Process each account's data from the batched response
        assetDataCall.data.forEach((assetData, index) => {
          const account = accountGroup[index];
          if (!assetData || !assetData[0][0] || assetData[0][0].length < 1) return;

          ownerTokens.push([assetData[0][0], account])
          if (!assetData[0][0].length || !assetData[0][1].length || assetData[0][1] == "0") return;
          ownerIds.push([assetData[0][0], assetData[0][1], account])
          accs.push(account)

          for (let i = 0; i < assetData[0][0].length; i++) {
            if (assetData[0][0][i] === uniV4NFT) {
              uniV4Ids.push(assetData[0][1][i]);
            }
          }
        });
      } catch (error) {
        console.log(`Failed to fetch/process data for accounts ${accountGroup.join(', ')}:`, error);
        return;
      }
    }));

    api.log(`[arcadia] Processed batch ${Math.ceil((i + accountsPerBatch) / accountsPerBatch)} of ${Math.ceil(v2Accounts.length / accountsPerBatch)} for v2 accounts.`);

  }

  const assetDatasV1 = await api.multiCall({ abi: abi.generateAssetData, calls: v1Accounts, permitFailure: true })
  v1Accounts.forEach((account, i) => {
    const assetData = assetDatasV1[i];
    if (!assetData || !assetData.assets || !assetData.assets.length ) return;
    ownerTokens.push([assetData.assets, account])
    if (!assetData[0].length || !assetData[1].length) return;
    ownerIds.push([assetData[0], assetData[1], account])
    accs.push(account)

    for (let i = 0; i < assetData.assets.length; i++) {
      if (assetData.assets[i] === uniV4NFT) {
        uniV4Ids.push(assetData[1][i]);
      }
    }
  })

  if (alienBaseNFT)
    await sumTokens2({ api, owners: accs, uniV3ExtraConfig: { nftAddress: alienBaseNFT } })

  // add all simple ERC20s
  await api.sumTokens({ ownerTokens, blacklistedTokens: [uniNFT, uniV4NFT, slipNFT, slipV2NFT, wAeroNFT, sAeroNFT, sSlipNFT, sSlipV2NFT, alienBaseNFT, wsSlipNFT, wsSlipV2NFT],});

  // add all Arcadia-wrapped LP positions
  await unwrapArcadiaAeroLP({ api, ownerIds });

  // add all native LP positions
  // first add all uniswap v4 positions, without the owner(s) param
  // only call sumTokens2 if any uniswapv4 position is found, otherwise it will throw an error
  if (uniV4Ids.length > 0) {
    await sumTokens2({ api, resolveUniV4: true, uniV4ExtraConfig: {"positionIds":uniV4Ids}})
  }
  return sumTokens2({ api, owners: accs, resolveUniV3: true, resolveSlipstream: true, resolveSlipstreamV2: true})
}

module.exports = {
  methodology: "TVL is calculated as the sum of all Account values and the available balance in the liquidity pools. Assets are not double counted.",
  base: { tvl },
  isHeavyProtocol: true,
  start: '2024-03-25', // Mon Mar 25 2024 18:00:00 GMT+0000
  hallmarks: [
    ["2024-04-03", "Points program announced."],
  ],
};

const abi = {
  generateAssetData: 'function generateAssetData() view returns (address[] assets, uint256[], uint256[])',
  positionState: 'function positionState(uint256 tokenId) view returns ((uint128 fee0PerLiquidity, uint128 fee1PerLiquidity, uint128 fee0, uint128 fee1, uint128 amountWrapped, address pool))',
  stakedAeroPositionState: 'function positionState(uint256 tokenId) view returns ((address pool, uint128 amountStaked, uint128 lastRewardPerTokenPosition, uint128 lastRewardPosition))'
}