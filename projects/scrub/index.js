
const { sumTokens } = require("../helper/unwrapLPs")
const { staking } = require('../helper/staking')

const share = '0xD6597AA36DD90d7fCcBd7B8A228F2d5CdC88eAd0' // TIGER
const rewardPool = '0x44B4a1e8f34Bb52ed39854aD218FF94D2D5b4800'
const scrub = '0x05CaB739FDc0A4CE0642604c78F307C6c543cD6d'
const treasury = '0x101785025A90ae6a865E3161FF37a7483a088ADf'
const chain = 'cronos'
async function pool2(ts, _, chainBlocks) {
  const block = chainBlocks[chain]
  const balances = {}
  await sumTokens(balances, [
    ['0xD440433dAA33b3e3f2b5421046EAf84bEe6F40D0', rewardPool,], // LION-SVN LP
    ['0xaDeC6aaAa0765472EE9eBe524BD3454Fd733BAB9', rewardPool,], // TIGER-SVN LP
  ], block, chain, undefined, { resolveLP: true })

  return balances
}

module.exports = {
  cronos: {
    pool2,
    treasury: staking(treasury, share, 'cronos'),
    staking: staking(scrub, share, 'cronos'),
    tvl: async () => ({}),
  },
  methodology: 'amount staked on the platform and, the dao treasury',
}