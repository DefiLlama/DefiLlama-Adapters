const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { sumTokensExport,  } = require('../helper/unwrapLPs')

const addresses = {
  elfi: "0x4da34f8264cb33a5c9f17081b9ef5ff6091116f4",
  el: "0x2781246fe707bb15cee3e5ea354e2154a2877b16",
  elStaking: "0x3F0c3E32bB166901AcD0Abc9452a3f0c5b8B2C9D",
  dai: ADDRESSES.ethereum.DAI,
  usdt: ADDRESSES.ethereum.USDT,
  busd: ADDRESSES.ethereum.BUSD,
  usdc: ADDRESSES.ethereum.USDC,
  elfiStaking: [
    "0xb41bcd480fbd986331eeed516c52e447b50dacb4",
    "0xCD668B44C7Cf3B63722D5cE5F655De68dD8f2750",
    "0x24a7fb55e4ac2cb40944bc560423b496dfa8803f",
  ],
  bscElfi: "0x6C619006043EaB742355395690c7b42d3411E8c0",
  bscElfiStaking: [
    "0x73653254ED0F28D6E5A59191bbB38B06C899fBcA",
    "0x861c2221e4d73a97cd94e64c7287fd968cba03e4",
  ],
};

const moneyPools = {
  ethereum: [
    [addresses.dai, '0x527c901e05228f54a9a63151a924a97622f9f173'],
    [addresses.usdt, '0xe0bda8e3a27e889837ae37970fe97194453ee79c'],
    [addresses.usdc, '0x3fea4cc5a03e372ac9cded96bd07795ac9034d71'],
  ],
  bsc: [[ADDRESSES.bsc.BUSD, '0x5bb4d02a0ba38fb8b916758f11d9b256967a1f7f']]
}

function borrowed(chain) {
  return async (_, _b, {[chain]: block}) => {
    const pools = moneyPools[chain]
    const { output: bals } = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: pools.map(i => ({ target: i[0], params: i[1]})),
      chain, block,
    })
    const { output: totalSupplies } = await sdk.api.abi.multiCall({
      abi: 'erc20:totalSupply',
      calls: pools.map(i => ({ target: i[1]})),
      chain, block,
    })
    const balances = {}
    bals.forEach(({ input: { target }, output }, i) => {
      sdk.util.sumSingleBalance(balances,target,totalSupplies[i].output - output, chain)
    })
    return balances
  }
}

module.exports = {
  ethereum: {
    borrowed: borrowed('ethereum'),
    tvl: sumTokensExport({ tokensAndOwners: moneyPools.ethereum}),
    staking: sumTokensExport({
      tokens: [addresses.el, addresses.elfi],
      owners: [addresses.elStaking, ...addresses.elfiStaking],
    }),
  },
  bsc: {
    borrowed: borrowed('bsc'),
    tvl: sumTokensExport({ tokensAndOwners: moneyPools.bsc, chain: 'bsc'}),
    staking: stakings(addresses.bscElfiStaking, addresses.bscElfi, "bsc"),
  },
}; // node test.js projects/elysia/index.js
