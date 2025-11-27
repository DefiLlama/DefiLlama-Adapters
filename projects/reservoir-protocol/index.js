const { sumTokensExport, sumTokens2 } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: {
    // https://docs.reservoir.xyz/products/proof-of-reserves
    funds: [
      '0x0c7e4342534e6e8783311dCF17828a2aa0951CC7',
      '0x9BB2c38F57883E5285b7c296c66B9eEA4769eF80',
      '0x99A95a9E38e927486fC878f41Ff8b118Eb632b10',
      '0xE45321525c85fcc418C88E606B96daD8cBcc047f',
      // '0x841DB2cA7E8A8C2fb06128e8c58AA162de0CfCbC',  // duplicated in tokensAndOwners
      '0x99E8903bdEFB9e44cd6A24B7f6F97dDd071549bc',
      // '0x2Adf038b67a8a29cDA82f0Eceb1fF0dba704b98d',  // duplicated in tokensAndOwners
      '0xb82749F316CB9c06F38587aBecF3EB1bC842CC93',
      '0xC5deA68CCe26c014BEC516CDA70c107c534a73C4',
      // '0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61', - exluded RUSD because it is project's own token
    ],
    // [token, owner] pairs for direct balance queries
    tokensAndOwners: [
      ['0xe0a80d35bb6618cba260120b279d357978c42bce', '0x3063C5907FAa10c01B242181Aa689bEb23D2BD65'],
      [ADDRESSES.ethereum.sUSDe, '0x5563CDA70F7aA8b6C00C52CB3B9f0f45831a22b1'],
      // ['0xBeEf11eCb698f4B5378685C05A210bdF71093521', '0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61'], // wrapped version of RUSD, excluded steakRUSD
      ['0xBEeFFF209270748ddd194831b3fa287a5386f5bC', '0x841DB2cA7E8A8C2fb06128e8c58AA162de0CfCbC'],
      ['0xA0804346780b4c2e3bE118ac957D1DB82F9d7484', '0x289C204B35859bFb924B9C0759A4FE80f610671c'],
      ['0x777791C4d6DC2CE140D00D2828a7C93503c67777', '0x2adf038b67a8a29cda82f0eceb1ff0dba704b98d'],
      ['0x62C6E813b9589C3631Ba0Cdb013acdB8544038B7', '0x8d3A354f187065e0D4cEcE0C3a5886ac4eBc4903'],
      [ADDRESSES.ethereum.USDC, '0x4809010926aec940b550D34a46A52739f996D75D'],
    ],
  },
  plasma: {
    tokensAndOwners: [
      ['0x7519403E12111ff6b710877Fcd821D0c12CAF43A', '0x9A319b57B80c50f8B19DB35D3224655F3aDd8E4f'],
      ['0xa9C251F8304b1B3Fc2b9e8fcae78D94Eff82Ac66', '0x9A319b57B80c50f8B19DB35D3224655F3aDd8E4f'],
      ['0x1DD4b13fcAE900C60a350589BE8052959D2Ed27B', '0x9A319b57B80c50f8B19DB35D3224655F3aDd8E4f'],
      ['0x5D72a9d9A9510Cd8cBdBA12aC62593A58930a948', '0x9A319b57B80c50f8B19DB35D3224655F3aDd8E4f']
    ]
  },
  arbitrum: {
    tokensAndOwners: [
      ['0x5c0C306Aaa9F877de636f4d5822cA9F2E81563BA', '0x289C204B35859bFb924B9C0759A4FE80f610671c'],
      ['0x7e97fa6893871A2751B5fE961978DCCb2c201E65', '0x289C204B35859bFb924B9C0759A4FE80f610671c'],
      ['0x1A996cb54bb95462040408C06122D45D6Cdb6096', '0x289C204B35859bFb924B9C0759A4FE80f610671c']
    ]
  }
}

module.exports.ethereum = {
  tvl: async (api) => {
    const { funds, tokensAndOwners, } = config.ethereum

    const onChainDataTS = new Date('2025-11-22T00:00:00Z').getTime() / 1000

    if (api.timestamp < onChainDataTS) {

      // Get underlying tokens and balances from funds
      const tokens = await api.multiCall({ abi: 'address:underlying', calls: funds })
      const bals = await api.multiCall({ abi: 'uint256:totalValue', calls: funds })
      const decimals = await api.multiCall({ abi: 'uint8:decimals', calls: tokens })

      // Adjust balances and add
      api.add(tokens, bals.map((v, i) => v * 10 ** (decimals[i] - 18)))
    } else {
      await sumTokens2({ api, owners: funds, fetchCoValentTokens: true, tokenConfig: { onlyWhitelisted: false } })
    }

    // Add regular token balances
    await api.sumTokens({ tokensAndOwners })
  }
}

module.exports.plasma = { tvl: sumTokensExport(config.plasma) }
module.exports.arbitrum = { tvl: sumTokensExport(config.arbitrum) }
