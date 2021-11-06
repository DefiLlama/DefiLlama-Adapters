const sdk = require('@defillama/sdk')
const { sumTokensAndLPsSharedOwners, sumTokens, unwrapUniswapLPs } = require('../helper/unwrapLPs')

const OtterClamStakings = ['0xcF2A11937A906e09EbCb8B638309Ae8612850dBf']

const CLAM = '0x4d6A30EFBE2e9D7A9C143Fce1C5Bb30d9312A465'

const treasuryAddresses = ['0xab328Ca61599974b0f577d1F8AB0129f2842d765']

const MAI = '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1'
const CLAM_MAI_UNIV2 = '0x8094f4C9a4C8AD1FF4c6688d07Bd90f996C7CA21'

/*** Staking of native token (CLAM) TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {}

  for (const staking of OtterClamStakings) {
    const { output } = await sdk.api.erc20.balanceOf({
      target: CLAM,
      owner: staking,
      block: chainBlocks.polygon,
      chain: 'polygon',
    })
    sdk.util.sumSingleBalance(balances, 'polygon:' + CLAM, output)
  }

  return balances
}

/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of MAI LP and UNI-V2 balances
 ***/
async function treasuryTVL(timestamp, ethBlock, chainBlocks) {
  const balances = {}
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [MAI, false],
      [CLAM_MAI_UNIV2, true],
    ],
    treasuryAddresses,
    chainBlocks.polygon,
    'polygon',
    (address) => 'polygon:' + address
  )
  return balances
}

module.exports = {
  start: 1635897600, // Nov 3rd, 2021
  polygon: {
    tvl: treasuryTVL,
    staking,
  },
  methodology: 'Counts MAI, MAI LP (CLAM-MAI) on the treasury',
}
