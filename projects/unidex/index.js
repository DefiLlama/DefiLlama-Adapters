const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')
//const molten = "0x031d35296154279dc1984dcd93e392b1f946737b";

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

async function ArbitrumTvl(_time, _ethBlock, { arbitrum: block }) {
  const contracts = {
    "ethPool": "0xdAF7D157F5c6E0F1d7917Ca02a7C185cEF81e6d0",
    "usdcPool": "0x09E122453A079bc2Be621769ae7799e53dA0054E",
    "daiPool": "0xb764729C6bEbd6E60E151F2c46aFce7D6Ff513fD",
    "usdtPool": "0x9f6B9e253De52C5fD6c65283ff472b15520a7070",
    "wbtcPool": "0xe736742Eb62F271c48F4a26168FD8F356AeE68db",
    "arbPool": "0xF1Cb521C753e41906073eBEd30FE34BCB00845f8",
    "mimPool": "0x266B30394da3D99a846dD30A2F7C50bb523c5dE1",
    "gdaiPool": "0x7638Db20715c5AC09f52bE1E3a4DBb220680BdFd",
    "ramPool": "0x914172b52262E867D8f2959D884e0ea73795B2c6",
    "maiPool": "0xEfD0B28810dC3cdD88763f40DCc44462bb85Cf32",
    "gmxPool": "0xDaa78E776D3788F9FBABDAc02aa6De45f7BC50C6",
    "wstethPool": "0x53C6c525a635eF56Bce43d4523D90aACE551D81b",
    "gnsPool": "0x13ff1aB07540b1681173003E361D046530506c11",
    "capPool": "0x99DDb3E66A592579B9D46a47824042F62D690a9e",
    "unshethPool": "0x5372Af9b4E9d4b9C016574Dad0f2406Dfe023D5F",
  };
  const usdc = ADDRESSES.arbitrum.USDC;
  const dai = ADDRESSES.optimism.DAI;
  const usdt = ADDRESSES.arbitrum.USDT;
  const wbtc = ADDRESSES.arbitrum.WBTC;
  const arb = ADDRESSES.arbitrum.ARB;
  const mim = ADDRESSES.arbitrum.MIM;
  const gdai = "0xd85e038593d7a098614721eae955ec2022b9b91b";
  const ram = "0xaaa6c1e32c55a7bfa8066a6fae9b42650f262418";
  const mai = ADDRESSES.arbitrum.WSTETH;
  const gmx = ADDRESSES.arbitrum.GMX;
  const wsteth = ADDRESSES.arbitrum.WSTETH;
  const gns = "0x18c11FD286C5EC11c3b683Caa813B77f5163A122";
  const cap = "0x031d35296154279dc1984dcd93e392b1f946737b";
  const unsheth = "0x0Ae38f7E10A43B5b2fB064B42a2f4514cbA909ef";

  const chain = 'arbitrum'
  const tokens = [usdc, dai, nullAddress, usdt, wbtc, arb, mim, gdai, ram, mai, gmx, wsteth, gns, cap, unsheth]
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

async function BaseTvl(_time, _ethBlock, { base: block }) {
  const contracts = {
    "ethpool": "0x9Ba3db52BC401F4EF8ba23e56268C3AdE0290837",
  };
  const chain = 'base'
  const tokens = [nullAddress]
  const owners = Object.values(contracts)
  return sumTokens2({ chain, block, tokens, owners, })
}

async function EvmosTvl(_time, _ethBlock, { evmos: block }) {
  const contracts = {
    "stevmosPool": "0x21708707f03A19C3a4ea5E1a132B5cF96b86F294",
  };
  const stevmos = ADDRESSES.evmos.STEVMOS;
  const chain = 'evmos'
  const tokens = [stevmos, nullAddress]
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
    "ethPool": "0x68A4cF26705B3cEaB49d1C99DE98F3Db28ee767E"
  };
  const dai = ADDRESSES.optimism.DAI;
  const chain = 'optimism'
  const tokens = [dai, nullAddress]
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
  arbitrum: {
    tvl: ArbitrumTvl
  },
  base: {
    tvl: BaseTvl
  },
  boba: {
    tvl: BobaTvl
  },
  evmos: {
    tvl: EvmosTvl
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
