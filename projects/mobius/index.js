/*==================================================
  Modules
  ==================================================*/
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");


/*==================================================
  Addresses
  ==================================================*/
const wBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const wETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const cUSD = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const wBTCO = "0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE";
const pUSDC = "0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941";
const cUSDC = "0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7";
const CELO = "0x471EcE3750Da237f93B8E339c536989b8978a438";
const cUSDC_V2 = "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a";
const pUSDC_V2 = "0x1bfc26cE035c368503fAE319Cc2596716428ca44";
const wBTC_V2 = "0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B";

const decimals = {
  [wBTC]: 8,
  [wBTCO]: 8,
  [wBTC_V2]: 8,
  [cUSDC]: 6,
  [pUSDC]: 6,
  [cUSDC_V2]: 6,
  [pUSDC_V2]: 6,
  ["celo-dollar"]: 0,
  ["celo"]: 0,
};

// {[string: name]: {
//   address: string,
//   peggedTo: string
//   tokens: string[],
// }}
const pools = {
  poof_cusd_v2: {
    address: "0xa2F0E57d4cEAcF025E81C76f28b9Ad6E9Fbe8735",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0xEadf4A7168A82D30Ba0619e64d5BCf5B30B45226",
    ],
  },
  poof_celo_v2: {
    address: "0xFc9e2C63370D8deb3521922a7B2b60f4Cff7e75a",
    peggedTo: CELO,
    tokens: [
      "0x471EcE3750Da237f93B8E339c536989b8978a438",
      "0x301a61D01A63c8D670c2B8a43f37d12eF181F997",
    ],
  },
  usdc_optics_v2: {
    address: "0x9906589Ea8fd27504974b7e8201DF5bBdE986b03",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a",
    ],
  },
  dai_optics_v2: {
    address: "0xF3f65dFe0c8c8f2986da0FEc159ABE6fd4E700B4",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0x90Ca507a5D4458a4C6C6249d186b6dCb02a5BCCd",
    ],
  },
  weth_optics_v2: {
    address: "0x74ef28D635c6C5800DD3Cd62d4c4f8752DaACB09",
    peggedTo: wETH,
    tokens: [
      "0x2DEf4285787d58a2f811AF24755A8150622f4361",
      "0x122013fd7dF1C6F636a5bb8f03108E876548b455",
    ],
  },
  wbtc_optics_v2: {
    address: "0xaEFc4e8cF655a182E8346B24c8AbcE45616eE0d2",
    peggedTo: wBTC,
    tokens: [
      "0xD629eb00dEced2a080B7EC630eF6aC117e614f1b",
      "0xBAAB46E28388d2779e6E31Fd00cF0e5Ad95E327B",
    ],
  },
  pusdc_optics_v2: {
    address: "0xcCe0d62Ce14FB3e4363Eb92Db37Ff3630836c252",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0x1bfc26cE035c368503fAE319Cc2596716428ca44",
    ],
  },
  usdc_allbridge_avax: {
    address: "0x0986B42F5f9C42FeEef66fC23eba9ea1164C916D",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0xb70e0a782b058BFdb0d109a3599BEc1f19328E36",
    ],
  },
  usdc_allbridge_solana: {
    address: "0x63C1914bf00A9b395A2bF89aaDa55A5615A3656e",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0xCD7D7Ff64746C1909E44Db8e95331F9316478817",
    ],
  },
  usdc_eth_optics: {
    address: "0xA5037661989789d0310aC2B796fa78F1B01F195D",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0x2A3684e9Dc20B857375EA04235F2F7edBe818FA7",
    ],
  },
  usdc_poly_optics: {
    address: "0x2080AAa167e2225e1FC9923250bA60E19a180Fb2",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0xcC82628f6A8dEFA1e2B0aD7ed448bef3647F7941",
    ],
  },
  wbtc: {
    address: "0x19260b9b573569dDB105780176547875fE9fedA3",
    peggedTo: wBTC,
    tokens: [
      "0xD629eb00dEced2a080B7EC630eF6aC117e614f1b",
      "0xBe50a3013A1c94768A1ABb78c3cB79AB28fc1aCE",
    ],
  },
  weth: {
    address: "0xE0F2cc70E52f05eDb383313393d88Df2937DA55a",
    peggedTo: wETH,
    tokens: [
      "0x2DEf4285787d58a2f811AF24755A8150622f4361",
      "0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4",
    ],
  },
  usdt_moss: {
    address: "0xdBF27fD2a702Cc02ac7aCF0aea376db780D53247",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0xcFFfE0c89a779c09Df3DF5624f54cDf7EF5fDd5D",
    ],
  },
  usdc_moss: {
    address: "0x0ff04189Ef135b6541E56f7C638489De92E9c778",
    peggedTo: cUSD,
    tokens: [
      "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      "0x93DB49bE12B864019dA9Cb147ba75cDC0506190e",
    ],
  },
};
/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, ethBlock, { celo: block }) {
  const chain = "celo";
  const balances = {};

  const promises = Object.values(pools).map(async (pool) => {
    const { address, peggedTo, tokens } = pool;
    const peg =
      peggedTo === cUSD ? "celo-dollar" : peggedTo === CELO ? "celo" : peggedTo;
    if (!balances[peg]) {
      balances[peg] = BigNumber(0);
    }
    const tokenBalances = await Promise.all(
      tokens.map(async (token) => {
        const balance = await sdk.api.erc20.balanceOf({
          block,
          chain,
          target: token,
          owner: address,
        });
        const baseDecimals = decimals[token] ?? 18;
        const targetDecimals = decimals[peg] ?? 18;
        if (baseDecimals === targetDecimals) return BigNumber(balance.output);
        if (baseDecimals < targetDecimals)
          return BigNumber(balance.output).multipliedBy(
            BigNumber(10).exponentiatedBy(
              BigNumber(targetDecimals - baseDecimals)
            )
          );
        return BigNumber(balance.output).dividedBy(
          BigNumber(10).exponentiatedBy(
            BigNumber(baseDecimals - targetDecimals)
          )
        );
      })
    );
    balances[peg] = tokenBalances.reduce(
      (accum, cur) => accum.plus(cur),
      balances[peg]
    );
  });

  await Promise.all(promises);

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  start: 8606077, // January 19, 2021 11:51:30 AM
  celo: { tvl }
};

///
