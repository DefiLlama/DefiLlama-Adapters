const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')

async function arbTvl(api) {
    let ep_tokens = await get('https://estateprotocol.com/api/public/property/list')

    // Filter out tokens
    ep_tokens = ep_tokens.filter(t => t.propertyAddress && t.token_price)

    // Get total supply for each token
    const tokenSupplies_arb = await api.multiCall({calls: ep_tokens.map(t => t.propertyAddress), abi: 'erc20:totalSupply'});
    tokenSupplies_arb.map((supply, i) => api.add(ADDRESSES.arbitrum.USDC_CIRCLE, supply/1e18 * parseFloat(ep_tokens[i]['token_price']) * 1e6 ))
}

module.exports = {
  methodology: `TVL for Estate Protocol consists of the accumulation of all properties prices, each being tokenSupply * tokenPrice where tokenPrice is given by the API`,
  arbitrum: {
    tvl: arbTvl
  },
}
