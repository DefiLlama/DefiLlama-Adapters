const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

const FACTORY = '0x2CD526D05a7192D4BE246A9493cB1111807D58Bb'
const FROM_BLOCK = 45872616
const TEMPL_CREATED_EVENT = 'event TemplCreated (address indexed templ, address indexed priest, address indexed token, address treasury, address memberPool, address creator, uint256 baseEntryFee, string slug, string name, string description, string logoLink)'

async function tvl(api) {
  const logs = await getLogs2({ api, target: FACTORY, eventAbi: TEMPL_CREATED_EVENT, fromBlock: FROM_BLOCK })
  const tokensAndOwners = logs.flatMap(({ token, treasury, memberPool }) => [
    [token, treasury],
    [token, memberPool],
    [ADDRESSES.GAS_TOKEN_2, treasury],
  ])

  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    "TVL sums each Templ's entry token held by its Treasury and MemberPool, plus any native ETH held by its Treasury. The Templ list and per-templ entry token are fetched from TemplCreated factory logs, so newly created templs are picked up automatically. Pricing comes from coins.llama.fi; entry tokens without a CoinGecko listing or sufficient on-chain DEX liquidity contribute zero until liquidity exists.",
  base: { tvl },
}
