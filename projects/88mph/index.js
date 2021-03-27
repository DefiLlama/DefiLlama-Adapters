/*
  Modules
*/

const sdk = require('@defillama/sdk')
const abi = require('./abi')
const _ = require('underscore')
const BigNumber = require('bignumber.js')

/*
  Settings
*/
const dInterestAddresses = [
  '0x35966201A7724b952455B73A36C8846D8745218e', // Compound DAI
  '0x374226dbAa3e44bF3923AfB63f5Fd83928B7e148', // Compound USDC
  '0x19E10132841616CE4790920d5f94B8571F9b9341', // Compound UNI
  '0xe615e59353f70cA2424Aa0F24F49C639B8E924D3', // yearn yCRV
  '0x681Aaa7CF3F7E1f110842f0149bA8A4AF53Ef2Fd', // yearn crvSBTC
  '0x23Fa6b36E870ca5753853538D17C3ca7f5269e84', // Harvest yCRV
  '0xe8C52367b81113ED32bb276184e521C2fbE9393A', // Aave USDC
  '0xb1ABAac351e06d40441CF2CD97F6f0098e6473F2', // Harvest CRV:HUSD
  '0x2F3EFD1a90a2336ab8fa1B9060380DC37361Ca55', // Harvest 3CRV
  '0x3f5611F7762cc39FC11E10C864ae38526f650e9D', // Harvest CRV:HBTC
  '0x6712BAab01FA2dc7bE6635746Ec2Da6F8Bd73e71', // Aave sUSD
  '0xDC86AC6140026267E0873B27c8629eFE748E7146', // Aave DAI
  '0xD4837145c7e13D580904e8431cfD481f9794fC41', // Harvest CRV:oBTC
  '0x904F81EFF3c35877865810CCA9a63f2D9cB7D4DD', // yearn yaLINK
  '0x303CB7Ede0c3AD99CE017CDC3aBAcD65164Ff486', // Harvest CRV:STETH
  '0x22E6b9A65163CE1225D1F65EF7942a979d093039' // Harvest CRV:RENWBTC
]
const wrappedTokenToSubsitute = {
  '0x2fE94ea3d5d4a175184081439753DE15AeF9d614': { // CRV:oBTC
    address: '0x8064d9Ae6cDf087b1bcd5BDf3531bD5d8C537a68', // oBTC
    decimals: 18
  },
  '0xb19059ebb43466C323583928285a49f558E572Fd': { // CRV:HBTC
    address: '0x0316EB71485b0Ab14103307bf65a021042c6d380', // HBTC
    decimals: 18
  },
  '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858': { // CRV:HUSD
    address: '0xdf574c24545e5ffecb9a659c229253d4111d87e1', // HUSD
    decimals: 8
  },
  '0x06325440D014e39736583c165C2963BA99fAf14E': { // CRV:STETH
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    decimals: 18
  },
  '0x49849C98ae39Fff122806C06791Fa73784FB3675': { // CRV:RENWBTC
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    decimals: 8
  }
}

/*
  TVL
*/

async function tvl (timestamp, block) {
  const balances = {}
  const poolToUnderlyingToken = {}

  // Get deposit pools' underlying tokens
  const poolUnderlyingAddressResults = await sdk.api.abi.multiCall({
    calls: _.map(dInterestAddresses, (address) => ({
      target: address
    })),
    abi: abi.stablecoin
  })

  _.each(poolUnderlyingAddressResults.output, (token) => {
    if (token.success) {
      const underlyingTokenAddress = token.output
      const poolAddress = token.input.target
      poolToUnderlyingToken[poolAddress] = underlyingTokenAddress
      if (!balances[underlyingTokenAddress]) {
        balances[underlyingTokenAddress] = 0
      }
    }
  })

  // Get deposit pools' balances in underlying token
  const poolDepositBalanceResults = await sdk.api.abi.multiCall({
    block,
    calls: _.map(dInterestAddresses, (address) => ({
      target: address
    })),
    abi: abi.totalDeposit
  })

  _.each(poolDepositBalanceResults.output, (tokenBalanceResult) => {
    if (tokenBalanceResult.success) {
      let valueInToken = tokenBalanceResult.output
      const poolAddress = tokenBalanceResult.input.target
      let underlyingTokenAddress = poolToUnderlyingToken[poolAddress]
      // replace curve LP token with subsitute
      if (wrappedTokenToSubsitute[underlyingTokenAddress]) {
        const substituteInfo = wrappedTokenToSubsitute[underlyingTokenAddress]
        underlyingTokenAddress = substituteInfo.address
        valueInToken = BigNumber(valueInToken).div(BigNumber(10).pow(18 - substituteInfo.decimals)).integerValue()
        if (!balances[underlyingTokenAddress]) {
          balances[underlyingTokenAddress] = 0
        }
      }
      balances[underlyingTokenAddress] = BigNumber(balances[underlyingTokenAddress]).plus(valueInToken)
    }
  })

  return balances
}

/*
  Exports
*/

module.exports = {
  name: '88mph',
  token: 'MPH',
  category: 'lending',
  start: 1606109629, // Monday, November 23, 2020 5:33:49 AM GMT
  tvl
}
