const abi = require("./abi.json");
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')

const IBBTC = "0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F";

const yCRV = "0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8";
const yCrvPeak = "0xA89BD606d5DadDa60242E8DEDeebC95c41aD8986"

async function tvl(_timestamp, block) {
  const [ yCrvDistribution, ibbtcSupply, pps ] = await Promise.all([
    sdk.api.abi.call({
      block,
      target: yCrvPeak,
      abi: abi.yCrvDistribution
    }),
    sdk.api.erc20.totalSupply({
      target: IBBTC,
      block
    }),
    sdk.api.abi.call({
      target: IBBTC,
      abi: abi.pricePerShare,
      block
    })
  ]);

  const bitcoinBalance = BigNumber(ibbtcSupply.output).times(pps.output).div(10**36).toNumber()
  return {
    [yCRV]: yCrvDistribution.output.total,
    'bitcoin': bitcoinBalance
  }
}

module.exports = {
  hallmarks: [
    [1641600000, "Possible exploit, contracts paused"]
  ],
  ethereum:{
    tvl
  },
};
