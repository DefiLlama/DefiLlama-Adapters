const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs, sumTokens2 } = require("../helper/unwrapLPs");

const doki = "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544";
const azuki = "0x910524678C0B1B23FFB9285a81f99C29C11CBaEd";
const polyDoki = "0x5C7F7Fe4766fE8f0fa9b41E2E4194d939488ff1C";
const polyAzuki = "0x7CdC0421469398e0F3aA8890693d86c840Ac8931";

// STAKING
const ethStakingPools = [
  {
    pool: "0x0CE0f2b998C0a1b0280Dcc95935108781d18E65b",
    token: "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544",
  }, // DOKI
  {
    pool: "0x4a5573eE3F333260DB50A385F6fFDAc440fc80b1",
    token: "0x9cEB84f92A0561fa3Cc4132aB9c0b76A59787544",
  }, // DOKI
  {
    pool: "0xdf4F609134a84aae1D18dCe8d863b099c6455598",
    token: "0x910524678C0B1B23FFB9285a81f99C29C11CBaEd",
  }, // AZUKI
];

// POOL2 LPS
const ethPool2LPs = [
  {
    owner: "0x95583A6F7aAAA56C48b27413d070219e22844435",
    pool: "0x1D4b2B2a2Ca8762410801b51f128B73743439E39",
  }, // DOKI-ETH
  {
    owner: "0xB89cf3528A3a62C2f58BDbcFd7C15312a33ce91D",
    pool: "0x1D4b2B2a2Ca8762410801b51f128B73743439E39",
  }, // aDOKI-ETH
  {
    owner: "0x27599F0b45008dAD28899e8E278ab191673C9179",
    pool: "0x654def3E97C3F4218C3f49ace81687483C361b2b",
  }, // AZUKI-ETH
];

// POOLS
const ethPools = [
  {
    pool: "0xb3a2AF499aF8f717BB3431968f8e0b038C975686",
    token: ADDRESSES.ethereum.WBTC,
  }, // WBTC
  {
    pool: "0xde846827cE3022EcD5eFD6ed316a2dEf9AB299B8",
    token: ADDRESSES.ethereum.WETH,
  }, // WETH
];

// POLYGON POOL2 LPS
const polyPool2LPs = [
  {
    owner: "0xc0a1dFb85734E465C5dadc5683DE58358C906598",
    pool: "0xd0985A2E8410c03B3bB0D7997DA433428D58342f"
  }, // AZUKI-MUST
  {
    owner: "0x69Cb6f98E45c13A230d292bE0a6aF93a6521c39B",
    pool: "0x92Bb3233F59561FC1fEC53EfC3339E4Af8E917F4"
  }, // AZUKI-ETH
  {
    owner: "0x2146baC214D9BF2Da56c3d4A69b9149e457F9d8c",
    pool: "0x9cb31B03089eca4C0f42554256d0217326D15AE7"
  }, // DOKI-MUST
  {
    owner: "0xBbDC1681e43549d3871CF1953D1dD9afF320feF0",
    pool: "0xcCeD5cB001D6081c4561bf7911F11Ccd9aAA1474"
  } // DOKI-ETH
];

const polyStakingPools = [
  {
    pool: "0xE699FFCeD532BB43BD2A84C82c73C858758d12cC",
    token: "0x5C7F7Fe4766fE8f0fa9b41E2E4194d939488ff1C"
  } // DOKI
]

async function calcTvl(block, chain, pool) {
  const toa = pool.map(i => (i.token ? [i.token, i.pool] : [i.pool, i.owner]))
  return sumTokens2({ chain, block, tokensAndOwners: toa })
}

async function pool2(balances, block, chain, pool) {
  let lpPositions = [];
  let lpBalances = (
    await sdk.api.abi.multiCall({
      calls: pool.map((p) => ({
        target: p.pool,
        params: p.owner,
      })),
      abi: "erc20:balanceOf",
      block: block,
      chain: chain
    })
  ).output;
  lpBalances.forEach((i) => {
    lpPositions.push({
      balance: i.output,
      token: i.input.target,
    });
  });
  await unwrapUniswapLPs(balances, lpPositions, block, chain, addr=>`${chain}:${addr}`);
  return balances;
}

async function ethTvl(timestamp, block) {
  return calcTvl(block, "ethereum", ethPools);
}

async function ethStaking(timestamp, block) {
  return calcTvl(block ,"ethereum", ethStakingPools);
}

async function ethPool2(timestamp, block) {
  return pool2({}, block, "ethereum", ethPool2LPs);
}

async function polygonStaking(timestamp, block, chainBlocks) {
  return calcTvl(chainBlocks.polygon, "polygon", polyStakingPools);
}

async function polygonPool2(timestamp, block, chainBlocks) {
  return pool2({}, chainBlocks.polygon, "polygon", polyPool2LPs);
}


module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: ethStaking,
    pool2: ethPool2
  },
  polygon: {
    tvl: async () => ({}),
    staking: polygonStaking,
    pool2: polygonPool2
  },
};
