const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require('../helper/coreAssets.json')

// https://facts.frax.finance/frxusd/balance-sheet
const config = {
  ethereum: {
    tokens: [
      ADDRESSES.ethereum.USDC,
      '0x1feCF3d9d4Fee7f2c02917A66028a48C6706c179',
      '0x43415eB6ff9DB7E26A15b704e7A3eDCe97d31C4e',
      '0x7712c34205737192402172409a8F7ccef8aA2AEc',
    ],
    owners: [
      '0x4FA39D8Bd268aa07A3C441F04E07c8825E2ab163',
      '0x5fbAa3A3B489199338fbD85F7E3D444dc0504F33',
      '0xE827ABf9F462Ac4f147753D86bc5f91E186E4E9c',
      '0x860Cc723935FC9A15fF8b1A94237a711DFeF7857',
      '0x4F95C5bA0C7c69FB2f9340E190cCeE890B3bd87c',
    ],
  },
  // solana: {
  //   tokenAccounts: ['FyzmSQ7UcXbJXoY8RN9qA3Ef9dagDe7mUDVzKJns2eEf']
  // }
}

Object.keys(config).forEach(chain =>
  module.exports[chain] = { tvl: sumTokensExport(config[chain]) }
)