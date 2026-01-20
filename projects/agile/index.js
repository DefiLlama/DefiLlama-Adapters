module.exports = {
  deadFrom: '2022-06-28',
  methodology: "Liquidity on DEX and supplied and borrowed amounts found using the unitroller address(0x643dc7C5105d1a3147Bd9524DFC3c5831a373F1e)",
    cronos: {
    
    tvl: () => ({}),
    borrowed: () => ({}),
  }
}

module.exports.cronos.borrowed = () => ({}) // bad debt