const { multiCall, sumTokens, } = require("../helper/chain/starknet");
const { assetTokenAbi } = require("./abi");

const supplyTokens = [
  "0x1320a9910e78afc18be65e4080b51ecc0ee5c0a8b6cc7ef4e685e02b50e57ef",
  "0x436d8d078de345c11493bd91512eae60cd2713e05bcaa0bb9f0cba90358c6e",
  "0x5fa6cc6185eab4b0264a4134e2d4e74be11205351c7c91196cb27d5d97f8d21",
  "0x3bcecd40212e9b91d92bbe25bb3643ad93f0d230d93237c675f46fac5187e8c",
  "0x19c981ec23aa9cbac1cc1eb7f92cf09ea2816db9cbd932e251c86a2e8fb725f",
  "0x7514ee6fa12f300ce293c60d60ecce0704314defdb137301dae78a7e5abbdd7"
]

const debtTokens = [
  "0x2614c784267d2026042ab98588f90efbffaade8982567e93530db4ed41201cf",
  "0x1ef7f9f8bf01678dc6d27e2c26fb7e8eac3812a24752e6a1d6a49d153bec9f3",
  "0x12b8185e237dd0340340faeb3351dbe53f8a42f5a9bf974ddf90ced56e301c7",
  "0x21d8d8519f5464ec63c6b9a80a5229c5ddeed57ecded4c8a9dfc34e31b49990",
  "0x7eeed99c095f83716e465e2c52a3ec8f47b323041ddc4f97778ac0393b7f358",
  "0x1bdbaaa456c7d6bbba9ff740af3cfcd40bec0e85cd5cefc3fbb05a552fd14df"
]

async function tvl(api) {
  const underlyings = await multiCall({ calls: supplyTokens, abi: assetTokenAbi.rToken_underlying_asset, });
  return sumTokens({ api, tokensAndOwners: underlyings.map((u, i) => [u, supplyTokens[i]]) })
}

async function borrowed(api) {
  const borrowed = await multiCall({ calls: debtTokens, abi: assetTokenAbi.totalSupply, });
  const underlyings = await multiCall({ calls: debtTokens, abi: assetTokenAbi.get_underlying_asset, });
  api.addTokens(underlyings, borrowed);
}

module.exports = {
  methodology:
    "Value of user supplied asset on Hashstack is considered as TVL",
  starknet: {
    tvl,
    borrowed,
  },
  hallmarks: [
    [1701066795, "Hashstack Mainnet launch"],
  ]
};
