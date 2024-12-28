const { sumTokens } = require("./helper/sumTokens");
const ADDRESSES = require('./helper/coreAssets.json')
const bitcoinAddressBook = require('./helper/bitcoin-book/index.js')

// WALLETS FROM HERE https://wbtc.network/dashboard/audit
const owners = bitcoinAddressBook.wbtc

async function tvl(api){
  if(api.timestamp > Date.now()/1e3 - 3600){
    return sumTokens({ owners, api })
  } else {
    const supply = await api.call({ target: ADDRESSES.ethereum.WBTC, abi: 'erc20:totalSupply', })
    api.add(ADDRESSES.ethereum.WBTC, supply)
  }
}

module.exports = {
  bitcoin: { tvl },
  methodology: `TVL for WBTC consists of the BTC deposits in custody that were used to mint WBTC`,
};
