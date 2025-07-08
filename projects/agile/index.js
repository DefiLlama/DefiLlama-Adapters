module.exports = {
  deadFrom: '2022-06-28',
  methodology: "Liquidity on DEX and supplied and borrowed amounts found using the unitroller address(0x643dc7C5105d1a3147Bd9524DFC3c5831a373F1e)",
    cronos: {
    //staking: stakingPricedLP("0x37619cC85325aFea778830e184CB60a3ABc9210B", "0x9A92B5EBf1F6F6f7d93696FCD44e5Cf75035A756", "moonriver", "0xbBe2f34367972Cb37ae8dea849aE168834440685", "moonriver"),
    
    tvl: () => ({}),
    borrowed: () => ({}),
  }
}

module.exports.cronos.borrowed = () => ({}) // bad debt