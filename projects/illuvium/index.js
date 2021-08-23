const {sumTokensAndLPs} = require('../helper/unwrapLPs')

const slp = "0x6a091a3406E0073C3CD6340122143009aDac0EDa"
const ilvstk = "0x25121EDDf746c884ddE4619b573A7B10714E2a36"
const ilv = "0x767fe9edc9e0df98e07454847909b5e959d7ca0e"
const slpstk = "0x8B4d8443a0229349A9892D4F7CbE89eF5f843F72"
const snxstk = "0x9898d72c2901D09E72A426d1c24b6ab90eB100e7"
const snx = "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f"
const axsstk = "0x099A3B242dceC87e729cEfc6157632d7D5F1c4ef"
const axs = "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b"
const xyz = "0x618679df9efcd19694bb1daa8d00718eacfa2883"
const xyzstk = "0x4C6997D462b0146fA54b747065411C1Ba0248595"

async function getTvl(tokens, block){
  const balances = {}
  await sumTokensAndLPs(balances, tokens, block)

  return balances
}

async function staking(timestamp, block) {
  return getTvl([
    [ilv, ilvstk],
  ], block)
}

async function pool2(timestamp, block) {
  return getTvl([
    [slp, slpstk, true],
  ], block)
}

async function tvl(timestamp, block) {
  return getTvl([
    [ilv, ilvstk],
    [slp, slpstk, true],
    [snx, snxstk],
    [axs, axsstk],
    [xyz, xyzstk],
  ], block)
}

module.exports = {
  methodology: `Counts the tokens staked on the core pools (ILV and ILV/ETH SLP) and flash pools, currently SNX on 0x9898d72c2901D09E72A426d1c24b6ab90eB100e7, AXS on 0x099A3B242dceC87e729cEfc6157632d7D5F1c4ef and XYZ on 
  0x4C6997D462b0146fA54b747065411C1Ba0248595 pool2 are the SLP tokens locked on 0x8B4d8443a0229349A9892D4F7CbE89eF5f843F72 and staking are the ILV tokens on 0x25121EDDf746c884ddE4619b573A7B10714E2a36`,
  staking:{
    tvl: staking
  },
  pool2:{
    tvl: pool2
  },
  ethereum:{
    tvl
  },
  tvl
}