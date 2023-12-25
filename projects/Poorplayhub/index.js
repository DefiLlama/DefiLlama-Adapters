
const { sumTokens2 } = require('../helper/unwrapLPs')

const transformKey = () => 'arbitrum:0xF154948b9eF1e0347eFA853678801b3C89387F53';

const config = {
  arbitrum: {
    Gold_TOKEN_CONTRACT: '0xF154948b9eF1e0347eFA853678801b3C89387F53',
    GAME_CONTRACT: '0x8cfE86cEfb26B0D1683D26fFdc9a9Ff780AD2392',
    TREASURY_CONTRACT: '0xB00881389F86dCBE58e63FfdD969bfBFc1b1d9aE'
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { Gold_TOKEN_CONTRACT} = config[chain]
  module.exports[chain] = {
    tvl: () => ({}),
    staking: (_, _b, { [chain]: block }) => {
      return sumTokens2({ chain, block, tokens: [Gold_TOKEN_CONTRACT], transformAddress: transformKey, })
    },
  }
})
