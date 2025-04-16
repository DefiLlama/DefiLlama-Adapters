const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache');
const {api} = require("@defillama/sdk");

const addresses = {
  arbitrum: {
    cbl: "0xD6b3d81868770083307840F513A3491960b95cb6",
    cblStakingV2: "0xc0C1DaA773570C041c47cE12c397AdDFD6B7403F",
  },
  polygon: {
    fund: {
      vaults: {
        liquidStoneFund: "0x2eda17eb596858566be933b26fae6fa4ee8ccd6d",
        pureStoneFund: "0xd93e3793471e22f2806bc3e0447fc46fb509390b",
      },
      navCalculator: "0xcdf038dd3b66506d2e5378aee185b2f0084b7a33",
    }
  },
}

// Credbull DeFi Vaults v1 TVL (6 or 12 month fixed APY)
async function tvl(api) {
  let vaults = await getConfig('credbull', "https://incredbull.io/api/vaults")
  vaults = vaults[api.chain]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })

  return api.sumTokens({ tokensAndOwners2: [tokens, vaults] })
}

// Credbull Fund (e.g. LiquidStone Fund)
async function borrowedFund(api) {
  const fundVaults = Object.values(addresses.polygon.fund.vaults);

  const fundNavResults = await api.multiCall({
    abi: 'function calcNav(address _vaultProxy) external returns (address denominationAsset, uint256 nav)',
    calls: fundVaults,
    target: addresses.polygon.fund.navCalculator,
    excludeFailed: true,
  });

  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: fundVaults.map((vault) => ({
      target: ADDRESSES.polygon.USDC_CIRCLE,
      params: [vault],
    })),
  });

  balances.forEach((bal) => {
    api.add(ADDRESSES.polygon.USDC_CIRCLE, bal * -1);
  });

  fundNavResults.forEach(({ denominationAsset, nav }) => {
    api.add(denominationAsset, nav);
  });

  api.getBalancesV2().removeNegativeBalances();
}

async function polygonTvl(api) {
  const fundVaults = Object.values(addresses.polygon.fund.vaults);

  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: fundVaults.map((vault) => ({
      target: ADDRESSES.polygon.USDC_CIRCLE,
      params: [vault],
    })),
  });

  balances.forEach((bal) => {
    api.add(ADDRESSES.polygon.USDC_CIRCLE, bal);
  });
}

async function borrowedVaults(api) {
  const vaults = await getVaultsForChain(api.chain);
  if (vaults.length === 0) return; // no vaults for this chain, return early

  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'address:totalAssets', calls: vaults })
  api.add(tokens, bals)
  const tBals = (await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((t, i) => ({ target: t, params: vaults[i] })) })).map(i => i * -1)
  api.add(tokens, tBals)
}

// get Credbull DeFi vaults
async function getVaultsForChain(chain) {
  // v1 vaults (e.g. inCredbull Earn)
  const v1Vaults = (await getConfig('credbull', "https://incredbull.io/api/vaults"))[chain] || [];
  // v2 vaults (e.g. LiquidStone X Plume)
  const v2Vaults = addresses[chain]?.v2Vaults || [];

  return [...v1Vaults, ...v2Vaults];
}

async function stakedCbl(api) {
  const bals = await api.multiCall({ abi: 'address:totalAssets', calls: [addresses.arbitrum.cblStakingV2,] })
  api.add(addresses.arbitrum.cbl, bals)
}

module.exports = {
  methodology: 'TVL consist of the sum of every deposit of all vaults for a given asset.',
  arbitrum: { tvl, borrowed: borrowedVaults, staking: stakedCbl },
  btr: { tvl, borrowed: borrowedVaults, },
  polygon: { borrowed: borrowedFund, tvl: polygonTvl },
};
