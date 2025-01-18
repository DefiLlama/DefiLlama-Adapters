const { sumTokens } = require("../helper/chain/ton");
const { sleep } = require('../helper/utils')
const { get } = require('../helper/http')

const ADDRESSES = require("../helper/coreAssets.json");

const evaaPools = {
  ["0:bcad466a47fa565750729565253cd073ca24d856804499090c2100d95c809f9e"]: [ // main pool
    "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe", // usdt
    "0:729c13b6df2c07cbf0a06ab63d34af454f3d320ec1bcd8fb5c6d24d0806a17c2", // jusdt
    "0:7e30fc2b7751ba58a3642f3fd59d5e96a810ddd78d8a310bfe8353bef10500df", // jusdc
    "0:cd872fa7c5816052acdf5332260443faec9aacc8c21cca4d92e7f47034d11892", // stTON
    "0:bdf3fa8098d129b54b4f73b5bac5d1e1fd91eb054169c3916dfc8ccd536d1000", // tsTON
  ],
  ["0:489595f65115a45c24a0dd0176309654fb00b95e40682f0c3e85d5a4d86dfb25"]: [ // lp pool
    "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe", // usdt
    "0:3e5ffca8ddfcf36c36c9ff46f31562aab51b9914845ad6c26cbde649d58a5588", // tonusdt_dedust
    "0:8d636010dd90d8c0902ac7f9f397d8bd5e177f131ee2cca24ce894f15d19ceea", // ton_storm
    "0:aea78c710ae94270dc263a870cf47b4360f53cc5ed38e3db502e9e9afb904b11", // USDT_STORM
  ],
  ["0:0d511552ddf8413bd6e2be2837e22c89422f7b16131ba62be8d5a504012d8661"]: [ // alts pool
    "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe", // usdt
    "0:2f956143c461769579baef2e32cc2d7bc18283f40d20bb03e432cd603ac33ffc", // not
    "0:afc49cb8786f21c87045b19ede78fc6b46c51048513f8e9a6d44060199c1bf0c", // dogs
    "0:fe72f474373e97032441bdb873f9a6d3ad10bab08e6dbc7befa5e42b695f5400", // cati 
  ],
}

async function processPoolTokens(api, poolAddress, tokens) {
  const { balances } = await get(`https://tonapi.io/v2/accounts/${poolAddress}/jettons?currencies=usd`)
  await sleep(1000 * (3 * Math.random() + 3))

  const totalBalance = balances.reduce((acc, { balance, price, jetton }) => {
    // Filtering based on the tokens in the pool
    if (!tokens.includes(jetton.address)) return acc;

    const decimals = jetton.decimals;
    const usdPrice = price?.prices?.USD;
    if (!decimals || !usdPrice) return acc;

    const bal = balance * usdPrice / 10 ** decimals;
    return acc + bal;
  }, 0);

  api.add('tether', totalBalance, { skipChain: true })
}

async function getAllJettonsAndFilter(api) {
  for (const [poolAddress, tokens] of Object.entries(evaaPools)) {
    await sumTokens({ api, owner: poolAddress, tokens: [ADDRESSES.null] })
    await processPoolTokens(api, poolAddress, tokens)
  }
}

module.exports = {
  methodology: 'Counts EVAA assets supplies as TVL.',
  ton: {
    tvl: async function (api) {
      await getAllJettonsAndFilter(api)
    },
  }
}
