const abi = require("./abi.json");
const sdk = require('@defillama/sdk')
const BigNumber = require('bignumber.js')

const DUSD = "0x5bc25f649fc4e26069ddf4cf4010f9f706c23831";
const IBBTC = "0xc4E15973E6fF2A35cC804c2CF9D2a1b817a8b40F";

async function tvl(_timestamp, ethBlock) {
  const [dusdSupply, ibbtcSupply, pps] = await Promise.all([
      sdk.api.erc20.totalSupply({
        target: DUSD,
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
    [DUSD]: dusdSupply.output,
    'bitcoin': bitcoinBalance
  }
}

module.exports = {
  ethereum:{
    tvl
  },
  tvl,
};
