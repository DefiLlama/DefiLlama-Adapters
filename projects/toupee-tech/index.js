const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const WIG = "0x58dd173f30ecffdfebcd242c71241fb2f179e9b9";
const vWIG = "0x60c08737877a5262bdb1c1cAC8FB90b5E5B11515";

async function staking(api) {
  const bal = await api.call({ abi: 'erc20:balanceOf', target: WIG, params: vWIG })
  const price = await api.call({ abi: 'uint256:getMarketPrice', target: WIG })

  api.add(ADDRESSES.base.WETH, bal * price / 1e18)
}

async function borrowed(api) {
  api.add(ADDRESSES.base.WETH, await api.call({ abi: 'uint256:debtTotal', target: WIG }))
}

module.exports = {
  methodology: `Counts the number of locked WETH in the Toupee Tech Bonding Curve. Staking accounts for the WIG locked in ToupeeTechVoter (0x60c08737877a5262bdb1c1cAC8FB90b5E5B11515)`,
  base: {
    tvl: sumTokensExport({ owner: WIG, tokens: [ADDRESSES.base.WETH] }),
    borrowed, staking,
  },
};
