const sdk = require('@defillama/sdk');
const abiPolygon = {
    "IronSwap": {
      "getTokenBalances": "uint256[]:getTokenBalances",
      "getTokens": "address[]:getTokens"
    },
    "IronController": {
      "getAllMarkets": "address[]:getAllMarkets"
    },
    "rToken": {
      "getCash": "uint256:getCash",
      "underlying": "address:underlying",
      "symbol": "string:symbol"
    }
  };
const { compoundExports2 } = require('../helper/compound');

const Contracts = {
  polygon: {
    pools: {
      is3usd: '0x837503e8a8753ae17fb8c8151b8e6f586defcb57',
      ispusd: '0x4a783cd1b4543559ece45db47e07e0cb59e55c09',
      isxusd: '0xe440ccc13e6f273c110cf3cf4087c23a66b8e872',
      isiron: '0xCaEb732167aF742032D13A9e76881026f91Cd087',
    },
    ignoredLps: ['0xb4d09ff3da7f9e9a2ba029cb0a81a989fd7b8f17'],
    lend: {
      ironController: '0xF20fcd005AFDd3AD48C85d0222210fe168DDd10c',
    },
  },
  avax: {
    pools: {
      is3usd: '0x952BDA8A83c3D5F398a686bb4e8C6DD90072d523',
    },
  },
  fantom: {
    pools: {
      is3usd: '0x952BDA8A83c3D5F398a686bb4e8C6DD90072d523',
    },
    lend: {
      ironController: '0xDc4C597E36Fc80876801df0309Cc11A7C12E0764',
    },
  },
};

async function tvl(api) {
  const blacklistedTokensSet = new Set((Contracts[api.chain].ignoredLps || []).map(i => i.toLowerCase()));
  const pools = Object.values(Contracts[api.chain].pools);
  const tokens = await api.multiCall({ abi: abiPolygon.IronSwap.getTokens, calls: pools })
  const bals = await api.multiCall({ abi: abiPolygon.IronSwap.getTokenBalances, calls: pools })
  bals.forEach((it, i) => {
    const _tokens = tokens[i]
    it.forEach((balance, j) => {
      const token = _tokens[j];
      if (blacklistedTokensSet.has(token.toLowerCase())) return;
      api.add(token, balance);
    })
  })
  return api.getBalances()
}

const { tvl: polygonLending, borrowed: polygonBorrowed } =
  compoundExports2({ comptroller: Contracts.polygon.lend.ironController, cether: "0xCa0F37f73174a28a64552D426590d3eD601ecCa1" })
const { tvl: fantomLending, borrowed: fantomBorrowed } =
  compoundExports2({ comptroller: Contracts.fantom.lend.ironController, cether: "0xdfce3E14a8c77D32fe2455a9E56424F149E2F271" })

module.exports = {
  polygon: {
    tvl: sdk.util.sumChainTvls([tvl, polygonLending]),
    borrowed: polygonBorrowed
  },
  avax: {
    tvl: tvl,
  },
  fantom: {
    tvl: sdk.util.sumChainTvls([tvl, fantomLending]),
    borrowed: fantomBorrowed
  },
  hallmarks: [
    ['2022-05-11', "Re-entrancy Exploit"]
  ],
};
