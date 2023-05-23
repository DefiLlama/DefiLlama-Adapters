const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens")

const KDAI = ADDRESSES.klaytn.KDAI;
const KSD = ADDRESSES.klaytn.KSD;
const wrappedKlay = '0xd7a4d10070a4f7bc2a015e78244ea137398c3b74'
const TREASURY = "0x03c812eE50e244909efE72e8c729976ACc5C16bb";
const token = "0xd676e57ca65b827feb112ad81ff738e7b6c1048d";
const STAKING_ADDR = "0x39281362641da798de3801b23bfba19155b57f13";

const LPs = [
  {
    address: '0xdf5caf79899407da1c1b31389448861a9846956d', // KDAI_KRNO_LP
    tokens: [
      KDAI,
    ]
  },
  {
    address: '0x5876aa130de74d9d8924e8ff05a0bc4387ee93f0', // KSD_KRNO_LP
    tokens: [
      KSD,
    ]
  },
  {
    address: '0x193ce4066aebe1911feb03425d4312a7b6514081', // KRNO_KLAY_LP
    tokens: [ ]
  },
  {
    address: '0x2febbaed702b9a1d9f6ffccd67701550ac546115',  // KRNO_KSP_LP
    tokens: [
      ADDRESSES.klaytn.KSP,
    ]
  }
]

const chain = 'klaytn'
let balanceResolve

async function addToBalance({ balances, lp, owner, transform, block }) {
  let valueToken = lp.tokens[0] || wrappedKlay
  const lpTokenValue = lp.tokens[0] ? sdk.api.erc20.balanceOf({ target: valueToken, owner: lp.address, block, chain }) : sdk.api.eth.getBalance({ target: lp.address, block, chain })

  const [
    valueBalance,
    lpSupply,
    lpBalance,
  ] = await Promise.all([
    lpTokenValue,
    sdk.api.erc20.totalSupply({ target: lp.address, block, chain }),
    sdk.api.erc20.balanceOf({ target: lp.address, owner, block, chain }),
  ]).then(all => all.map(i => i.output))

  const value = valueBalance * lpBalance * 2 / lpSupply
  sdk.util.sumSingleBalance(balances, transform(valueToken), value)
}

function getTvlPromise(key) {
  return async (ts, _block, chainBlocks) => {
    if (!balanceResolve)
      balanceResolve = getTvl(ts, _block, chainBlocks)
    return (await balanceResolve)[key]
  }
}

async function getTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks[chain]

  const balances = {
    staking: {},
    tvl: {}
  }
  const transform = await getChainTransform(chain)
  const fixBalances = await getFixBalances(chain)

  await Promise.all(LPs.map(lp => addToBalance({
    balances: balances.tvl,
    owner: TREASURY,
    block,
    lp,
    transform,
  })))

  const [
    tokenBalance,
    kdaiBalance,
    stakingBalance,
  ] = await Promise.all([
    sdk.api.erc20.balanceOf({ target: token, owner: LPs[0].address, block, chain }),
    sdk.api.erc20.balanceOf({ target: KDAI, owner: LPs[0].address, block, chain }),
    sdk.api.erc20.balanceOf({ target: token, owner: STAKING_ADDR, block, chain }),
  ]).then(all => all.map(i => i.output))

  const tokenPrice = kdaiBalance / tokenBalance
  const staking = stakingBalance * tokenPrice / 10 ** 18

  sdk.util.sumSingleBalance(balances.staking, 'tether', staking)
  fixBalances(balances.tvl)

  return balances
}

module.exports = {
  misrepresentedTokens: true,
  klaytn:
    ['tvl', 'staking']
      .reduce((acc, key) => ({ ...acc, [key]: getTvlPromise(key) }), {}),
};
