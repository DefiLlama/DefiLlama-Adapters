const { getConfig } = require('../helper/cache');

const cblConfigArbitrum = {
  cbl: "0xD6b3d81868770083307840F513A3491960b95cb6",
  cblStakingV2: "0xc0C1DaA773570C041c47cE12c397AdDFD6B7403F",
};

const fundConfigPolygon = {
  liquidStoneFund: "0x2eda17eb596858566be933b26fae6fa4ee8ccd6d",
  fundNavCalculator: "0xcdf038dd3b66506d2e5378aee185b2f0084b7a33",
};

// Credbull DeFi Vaults v1 TVL (6 or 12 month fixed APY)
async function tvl(api) {
  let vaults = await getConfig('credbull', "https://incredbull.io/api/vaults")
  vaults = vaults[api.chain]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })

  return api.sumTokens({ tokensAndOwners2: [tokens, vaults] })
}

// Credbull Fund, including LiquidStone
async function borrowedFund(api) {
  const fundNavResults = await api.multiCall({
    abi: 'function calcNav(address _vaultProxy) external returns (address denominationAsset, uint256 nav)',
    calls: [fundConfigPolygon.liquidStoneFund],
    target: fundConfigPolygon.fundNavCalculator,
    excludeFailed: true,
  })
  const vaultBalance = await api.call({ abi: 'erc20:balanceOf', target: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', params: fundConfigPolygon.liquidStoneFund })
  api.add('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', vaultBalance * -1)

  fundNavResults.forEach((i) => {
    api.add(i.denominationAsset, i.nav)
  });
  api.getBalancesV2().removeNegativeBalances()
}

async function polygonTvl(api) {
  const vaultBalance = await api.call({ abi: 'erc20:balanceOf', target: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', params: fundConfigPolygon.liquidStoneFund })
  api.add('0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', vaultBalance)
}

async function borrowed(api) {
  let vaults = await getConfig('credbull', "https://incredbull.io/api/vaults")
  vaults = vaults[api.chain]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'address:totalAssets', calls: vaults })
  api.add(tokens, bals)
  const tBals = (await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map((t, i) => ({ target: t, params: vaults[i] })) })).map(i => i * -1)
  api.add(tokens, tBals)
}

async function stakedCbl(api) {
  const bals = await api.multiCall({ abi: 'address:totalAssets', calls: [cblConfigArbitrum.cblStakingV2,] })
  api.add(cblConfigArbitrum.cbl, bals)
}

module.exports = {
  methodology: 'TVL consist of the sum of every deposit of all vaults for a given asset.',
  arbitrum: { tvl, borrowed, staking: stakedCbl },
  btr: { tvl, borrowed, },
  polygon: { borrowed: borrowedFund, tvl: polygonTvl },
};
