const { stakings } = require("../helper/staking");
const { default: BigNumber } = require('bignumber.js');

const WNK = "0xb160A5F19ebccd8E0549549327e43DDd1D023526";
const stakingContracts = [
  "0xc45047c5b26146d10a25295912c81098f94d8d1a",
  "0x5ff3450546c7c29cc47617f08f30b7e79371b3ed",
  "0x574d3630ce0aa8dd4eafd9ce3f24dc5c8a2b7d15"
];

async function staking(timestamp, ethBlock, chainBlocks) {
  const balances = await stakings(stakingContracts, WNK, 'bsc')(timestamp, ethBlock, chainBlocks)
  balances['the-winkyverse'] = BigNumber(balances[`bsc:${WNK}`]).div(1e18).toFixed(0);
  balances[`bsc:${WNK}`] = 0
  return balances
}

module.exports = {
  methodology: `TVL for Winkyverse consists of the staking of WNK into 3 staking (time-locked) contracts.`, 
  bsc:{
    tvl: () => ({}),
    staking, 
  }
}