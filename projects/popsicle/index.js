const ADDRESSES = require('../helper/coreAssets.json')
const poolInfoAbi = require("../helper/abis/masterchef.json");
const { sumTokens2 } = require('../helper/unwrapLPs');
const { addFundsInMasterChef } = require("../helper/masterchef");
const { getConfig } = require('../helper/cache')

const MasterChefContract = "0xbf513aCe2AbDc69D38eE847EFFDaa1901808c31c";
const ice = "0xf16e81dce15B08F326220742020379B855B87DF9";

function pool2(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    await addFundsInMasterChef(balances, MasterChefContract, chainBlocks[chain], chain, undefined, poolInfoAbi.poolInfo, [ice]);
    return balances;
  };
}

const config = {
  ethereum: 'https://analytics.back.popsicle.finance/api/v1/FragolaApy',
  polygon: 'https://analytics.back.popsicle.finance/api/v1/polygon/FragolaApy',
}

async function optimizerV3(time, block, _, {api}) {
  const data = await getConfig('popsicle/'+api.chain, config[api.chain])
  const pools = data.map(i => i.fragolaAddress)
  const token0s = await api.multiCall({  abi: 'address:token0', calls: pools})
  const token1s = await api.multiCall({  abi: 'address:token1', calls: pools})
  const bals = await api.multiCall({  abi: 'function usersAmounts() returns (uint256,uint256)', calls: pools})
  bals.forEach(([bal0, bal1], i) => {
    api.add(token0s[i], bal0)
    api.add(token1s[i], bal1)
  })
}
async function fantomTvl(timestamp, block, chainBlocks, {api}) {
  return api.sumTokens({ owner: '0xFDB988aF9ef9D0C430176f972bA82B98b476F3ee', tokens: ['0xddc0385169797937066bbd8ef409b5b3c0dfeb52']})
}

async function fantomStaking(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [
      ['0xf16e81dce15b08f326220742020379b855b87df9', '0xaE2e07276A77DAdE3378046eEd92FfDE3995b0D5'], // ICE
      [ADDRESSES.fantom.nICE, '0xBC8d95Ab498502242b41fdaD30bDFfC841f436e2'], // nICE
    ],
  })
}

// node test.js projects/popsicle/index.js
module.exports = {
  doublecounted: true,
  ethereum: {
    pool2: pool2("ethereum"),
    tvl: optimizerV3,
  },
  polygon: {
    tvl: optimizerV3,
  },
  bsc: {
    pool2: pool2("bsc"),
  },
  fantom: {
    pool2: pool2("fantom"),
    tvl: fantomTvl,
    staking: fantomStaking
  },
  methodology: "We count pool2 liquidity staked on masterchef",
};
