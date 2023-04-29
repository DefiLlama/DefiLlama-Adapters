const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')

async function FantomTvl(_time, _ethBlock, { fantom: block }) {
  const contracts = {
    "ftmPool": "0xBec7d4561037e657830F78b87e780AeE1d09Fc7B",
    "usdcPool": "0x7A494C755911Ce06444C47248108439a06Ac028C",
    "daiPool": "0xc451df1b05828519c014cb967ef1a614bd41834d",
  };
  const usdc = ADDRESSES.fantom.USDC;
  const dai = ADDRESSES.fantom.DAI;
  const chain = 'fantom'
  const tokens = [usdc, dai, nullAddress]
  const owners = Object.values(contracts)
  return sumTokens2({ chain, block, tokens, owners, })
}

async function BobaTvl(_time, _ethBlock, { boba: block }) {
  const contracts = {
    "ethpool": "0x9673B0E0F07e4a6da712F6847aE93C3F157DD509",
  };
  const chain = 'boba'
  const tokens = [nullAddress]
  const owners = Object.values(contracts)
  return sumTokens2({ chain, block, tokens, owners, })
}

async function MetisTvl(_time, _ethBlock, { metis: block }) {
  const contracts = {
    "metisPool": "0x9Ba3db52BC401F4EF8ba23e56268C3AdE0290837",
    "wethPool": "0xb3D7D548dA38Dac2876Da57842a3cbaaf9a3bD96",
  };
  const weth = ADDRESSES.metis.WETH;
  const chain = 'metis'
  const tokens = [weth, nullAddress]
  const owners = Object.values(contracts)
  return sumTokens2({ chain, block, tokens, owners, })
}

async function OpTvl(_time, _ethBlock, { optimism: block }) {
  const contracts = {
    "daiPool": "0xCdDF71750E596b4C38785afFEc3bd4C9bff43f6F",
  };
  const dai = ADDRESSES.optimism.DAI;
  const chain = 'optimism'
  const tokens = [dai]
  const owners = Object.values(contracts)
  return sumTokens2({ chain, block, tokens, owners, })
}

async function zkSyncTvl(_time, _ethBlock, { era: block }) {
  const contracts = {
    "usdcPool": "0xa41A6a4A04E711B53a82E594CeB525e89206627A",
  };
  const usdc = ADDRESSES.era.USDC;
  const chain = 'era'
  const tokens = [usdc]
  const owners = Object.values(contracts)
  return sumTokens2({ chain, block, tokens, owners, })
}

async function BscTvl(_time, _ethBlock, { bsc: block }) {
  const contracts = {
    "busdPool": "0xa8D4bd632f394CED42BD439Bc34F09198072e519",
  };
  const busd = ADDRESSES.bsc.BUSD;
  const chain = 'bsc'
  const tokens = [busd]
  const owners = Object.values(contracts)
  return sumTokens2({ chain, block, tokens, owners, })
}

module.exports = {
  methodology: "Assets staked in the pool and trading contracts",
  fantom: {
    tvl: FantomTvl
  },
  boba: {
    tvl: BobaTvl
  },
  metis: {
    tvl: MetisTvl
  },
  optimism: {
    tvl: OpTvl
  },
  era: {
    tvl: zkSyncTvl
  },
  bsc: {
    tvl: BscTvl
  },
};
