const { getFactoryTvl } = require('./factoryTvl')

const FACTORY_CONTRACT = 'terra1ypwj6sw25g0qcykv7mzmcvsndvx56r3yrgkaw3fds7yzwl7fwwcsnxkeh7';

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Liquidity on the GARUDA DEX",
  terra: { tvl: getFactoryTvl(FACTORY_CONTRACT) }
}