const abi = require("./abi.json");
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')

const IBBTC = "0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F";

const yCRV = "0xdf5e0e81dff6faf3a7e52ba697820c5e32d806a8";
const yUSD = "0x5dbcf33d8c2e976c6b560249878e6f1491bca25c";
const yCrvPeak = "0xA89BD606d5DadDa60242E8DEDeebC95c41aD8986"
const controller = "0x88fF54ED47402A97F6e603737f26Bb9e4E6cb03d"

async function tvl(_timestamp, ethBlock) {
  const [ yCrvBal, yUSDBal, ibbtcSupply, pps ] = await Promise.all([
      sdk.api.erc20.balanceOf({
        owner: yCrvPeak,
        target: yCRV,
        block: ethBlock
      }),
      sdk.api.erc20.balanceOf({
        owner: controller,
        target: yUSD,
        block: ethBlock
      }),
      sdk.api.erc20.totalSupply({
        target: IBBTC,
        block: ethBlock
      }),
      sdk.api.abi.call({
        target: IBBTC,
        abi: abi.pricePerShare,
        block: ethBlock
      })
    ]);

  const bitcoinBalance = BigNumber(ibbtcSupply.output).times(pps.output).div(10**36).toNumber()
  return {
    [yCRV]: yCrvBal.output,
    [yUSD]: yUSDBal.output,
    'bitcoin': bitcoinBalance
  }
}

module.exports = {
  ethereum:{
    tvl
  },
  tvl,
};
