const { sumTokens } = require("./helper/sumTokens");
const ADDRESSES = require('./helper/coreAssets.json')
const bitcoinAddressBook = require('./helper/bitcoin-book/index.js')
const sdk = require('@defillama/sdk');
const { getBlock } = require("@defillama/sdk/build/util/blocks.js");

// WALLETS FROM HERE https://wbtc.network/dashboard/audit
const owners = bitcoinAddressBook.wbtc

async function tvl(api){
  if(api.timestamp > Date.now()/1e3 - 3600){
    return sumTokens({ owners, api })
  } else {
    // get WBTC supply on Ethereum blockchain
    const block = await getBlock('ethereum', api.timestamp)
    const supply = await sdk.api2.abi.call({ chain: 'ethereum', target: ADDRESSES.ethereum.WBTC, abi: 'erc20:totalSupply', block: block.number })
    api.add(ADDRESSES.ethereum.WBTC, supply)
    return {[`ethereum:${ADDRESSES.ethereum.WBTC}`]: supply}
  }
}

module.exports = {
  bitcoin: { tvl },
  methodology: `TVL for WBTC consists of the BTC deposits in custody that were used to mint WBTC`,
};
