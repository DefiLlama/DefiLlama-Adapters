const { staking } = require('../helper/staking')
const { abi } = require("../yaxis/abi.js");
const constants = require("../yaxis/constants.js");

async function tvl(api) {
  const token = await api.call({ abi: 'address:want', target: constants.METAVAULT })
  const bal = await api.call({ abi: 'uint256:balance', target: constants.METAVAULT })
  api.add(token, bal)
  const tokens = await api.multiCall({ abi: 'address:token', calls: constants.VAULTS.map(v => v.vault) })
  const bals = await api.multiCall({ abi: 'uint256:balance', calls: constants.VAULTS.map(v => v.vault) })
  api.addTokens(tokens, bals)
}

async function staking_(api) {
  const token = constants.CURRENCIES["YAXIS"]
  api.add(token, await api.call({ abi: abi.votingEscrow, target: constants.VOTING_ESCROW }))
  api.add(token, await api.call({ abi: abi.yAxisBar, target: constants.BAR }))
  api.add(token, await api.call({ abi: 'erc20:totalSupply', target: constants.STAKING.YAXIS }))
  api.add(token, await api.call({ abi: 'erc20:totalSupply', target: constants.YAXIS_GAUGE }))
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
    staking: staking_,
    pool2: staking(constants.UNISWAP_LPS.map(i => i.staking), constants.UNISWAP_LPS.map(i => i.address))
  },
  start: 1600185600, // 09/16/2020 @ 12:00am (UTC+8)
};
