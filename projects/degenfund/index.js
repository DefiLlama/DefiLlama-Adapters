const { sumUnknownTokens } = require('../helper/unknownTokens')

module.exports = {
  methodology: "Calculates the total value of staked DFund tokens in our staker smart contract.",
  degen: {
    tvl: () => ({}),
    staking: tvl
  }
}

async function tvl(api) {
  const bal = await api.call({ abi: "uint256:totalDfundStaked", target: '0xe11CD52De12a86400311e0D2884aC9B542eEd05e' })
  api.add('0x0B946D939bb93609Fcce42220180E5C81B642786', bal)
  return sumUnknownTokens({ api, lps: ['0x9c0Dd6BA0E2c611585c75F06f024BC8826FdB446'], useDefaultCoreAssets: true })
}