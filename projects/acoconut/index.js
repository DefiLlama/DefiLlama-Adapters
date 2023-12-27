const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const singlePlusAbi = require('./abis/singlePlus');
const { sumTokens2 } = require('../helper/unwrapLPs')

const tokensInacBTC = [
  ADDRESSES.ethereum.WBTC,
  '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D'
]

const acBTCTokenHolder = '0x73FddFb941c11d16C827169Bb94aCC227841C396'

const bscSingleTokens = [
  '0xcf8D1D3Fce7C2138F85889068e50F0e7a18b5321', //vBTC+
  '0x73FddFb941c11d16C827169Bb94aCC227841C396', //fBTCB+
  '0xD7806143A4206aa9A816b964e4c994F533b830b0', //acsBTCB+
  '0x02827D495B2bBe37e1C021eB91BCdCc92cD3b604', //autoBTC+
]

const btcb = 'bsc:' + ADDRESSES.bsc.BTCB

async function eth(timestamp, block) {
  return sumTokens2({ block, owner: acBTCTokenHolder, tokens: tokensInacBTC})
}

async function bsc(timestamp, _, {bsc: block}) {
  const balances = {};

  const totalUnderlyingResults = await sdk.api.abi.multiCall({
    block,
    calls: bscSingleTokens.map((address) => ({
      target: address
    })),
    abi: singlePlusAbi["totalUnderlying"],
    chain: 'bsc'
  });

  totalUnderlyingResults.output.forEach((tokenBalanceResult) => {
      const valueInToken = tokenBalanceResult.output;
      sdk.util.sumSingleBalance(balances, btcb, valueInToken)
  });

  return balances;
}

module.exports = {
  ethereum:{
    tvl: eth,
  },
  bsc:{
    tvl: bsc
  },
  start: 1600185600,    // 09/16/2020 @ 12:00am (UTC+8)
};
