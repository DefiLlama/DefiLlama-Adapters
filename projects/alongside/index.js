const { sumTokens2 } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const aSTETH = "0x27C2B9fd547EAd2c05C305BeE2399A55811257c2"
  const vault = "0xf3bCeDaB2998933c6AAD1cB31430D8bAb329dD8C"
  const astBal = await api.call({ abi: 'erc20:balanceOf', target: aSTETH, params: vault })
  const stethBal = await api.call({ abi: 'erc20:balanceOf', target: ADDRESSES.ethereum.STETH, params: aSTETH })
  const astethSupply = await api.call({ abi: 'erc20:totalSupply', target: aSTETH })
  api.add(ADDRESSES.ethereum.STETH, stethBal * astBal / astethSupply)

  return sumTokens2({ api, owner: vault, fetchCoValentTokens: true, blacklistedTokens: [aSTETH] })
}

module.exports = {
  methodology:
    "Data is retrieved from calculation of market price and total supply",
  ethereum: {
    tvl,
  },
};
