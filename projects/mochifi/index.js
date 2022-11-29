// node test.js projects/mochifi/index.js
const { get } = require('../helper/http')
const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

async function ethereum(timestamp, block, chainBlocks) {
  const { vaults } = await get('https://backend.mochi.fi/vaults?chainId=1');

  const results = {}
  vaults
    .forEach(v => {
      if (+v.vaultDeposits > 0)
        sdk.util.sumSingleBalance(results, v.tokenAddress.toLowerCase(), BigNumber(v.vaultDeposits * (10 ** +v.decimals)).toFixed(0))
    })
  delete results['0x60ef10edff6d600cd91caeca04caed2a2e605fe5']
  return results
}

module.exports = {
  timetravel: false,
  methodology: "TVL counts collateral deposits to mint USDM",
  ethereum: {
    tvl: ethereum
  },
}
