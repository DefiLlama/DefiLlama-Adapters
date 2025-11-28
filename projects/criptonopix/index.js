const { sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const NIX_TOKEN = "0xBe96fcF736AD906b1821Ef74A0e4e346C74e6221";

const NIX_PANCAKE_LP = "0x7f01f344b1950a3C5EA3B9dB7017f93aB0c8f88E";

const TARGET_ADDRESSES = [
  NIX_PANCAKE_LP,
  "0x31EE4A9Ed7eF0CF0dcdF881eDc9c82C661a40b80",
  "0x90084B88c772ED1bA5dafa71430628fC6aE004ff",
  "0xbc15aaa0B1C37ebb7B506ADe0BFA35F16E67f534",
  "0xf7efE91bB756D7754aE8936e1F6041848f848AD3",
  "0x36E4c71917245746C45bF7A031166489986A75A8",
  "0x02f81Ca4CAb8fB64C82A6F1bC5E3EB32C62AFcA3",
  "0x7FA0a7cAF42B3CB5c3f7e4B73eBb3c797b10e4A5",
  "0xF952A11EB1456316e907f0B47b0dccd66c28B8B3",
  "0x317ba109B74F272253cF8f36c24331FBC5619f59",
  "0x36f15b07ebe31e05c4fcEb562bf973663EEB6Bf5",
  "0x6E653a3f76eCE9C3b1849b2159fDdf3bB20f0DF4",
  "0x16F1b9B34F2596c5538E0ad1B10C85D4B2820b82",
]

async function tvl(api) {
  // sumTokens2 automatically performs balanceOf calls
  return sumTokens2({
    resolveLPs: true,
    useDefaultCoreAssets: true,
    api,
    tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.WBNB, NIX_TOKEN, ADDRESSES.null],
    owners: TARGET_ADDRESSES,
  })
}

module.exports = {
  timetravel: true,
  methodology: "The TVL is counted as the total value of assets held in the protocol's treasury addresses on the BSC chain. The TVL is calculated by summing the USDT, BNB, NIX and WBNB value of all tokens held in these addresses in the protocol, using real-time price data from reliable sources.",
  start: 19632198, 
  bsc: {
    tvl,
  },
}