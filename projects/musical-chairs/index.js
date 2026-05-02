const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const contracts = {
  arbitrum: "0xEDA164585a5FF8c53c48907bD102A1B593bd17eF",
  ethereum: "0x7c01A2a7e9012A98760984F2715A4517AD2c549A",
  base: "0xEDA164585a5FF8c53c48907bD102A1B593bd17eF",
};

async function tvl(api) {
  const contract = contracts[api.chain]
  await sumTokensExport({ owner: contract, tokens: [ADDRESSES.null] })(api)
  const commission = await api.call({
    abi: "uint256:accumulatedCommission",
    target: contract,
  })
  api.add(ADDRESSES.null, -commission)
}

module.exports = {
  methodology: "TVL is calculated as the total ETH balance held in the MusicalChairsGame smart contract, representing active player stakes in current and pending games. Protocol-owned commissions are excluded.",
  arbitrum: {
    tvl,
  },
  ethereum: {
    tvl,
  },
  base: {
    tvl,
  },
};
