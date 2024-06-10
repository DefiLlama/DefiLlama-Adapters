const sdk = require("@defillama/sdk");

const { getLogs } = require('../helper/cache/getLogs');
const { CONTRACT_INFOS, zeroAddress } = require("./const");

async function tvl(api) {
  const chain = api.chain
  const CONTRACT_INFO = CONTRACT_INFOS[chain]
  const openEvents = await getLogs({
    api,
    target: CONTRACT_INFO.bookManagerContract.address,
    fromBlock: CONTRACT_INFO.bookManagerContract.fromBlock,
    eventAbi: CONTRACT_INFO.bookManagerContract.abi.openEvent,
    onlyArgs: true,
  })
  const tokens = [...new Set([...openEvents.map(({ base, quote }) => [base, quote]).flat()])]
  const erc20Tokens = tokens.filter(token => token !== zeroAddress)
  const includesEth = tokens.includes(zeroAddress)
  const [ethBalance, erc20Balances] = await Promise.all([
    sdk.api.eth.getBalance({
      target: CONTRACT_INFO.bookManagerContract.address,
    }),
    api.multiCall({
      abi: 'erc20:balanceOf',
      calls: erc20Tokens.map(
        token => ({
          target: token,
          params: CONTRACT_INFO.bookManagerContract.address,
        })
      ),
    })
  ])
  api.addTokens(erc20Tokens, erc20Balances)
  if (includesEth) {
    api.addToken(zeroAddress, ethBalance.output)
  }
  return api.getBalances()
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL consists of tokens in the Clober Book Manager contract",
  base: {
    tvl,
  },
  era: {
    tvl,
  },
};
