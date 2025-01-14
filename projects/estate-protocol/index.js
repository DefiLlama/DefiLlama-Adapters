const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

async function tvl(api) {
    const tokens = (await get('https://estateprotocol.com/api/public/property/list')).filter(t => t.propertyAddress && EVM_ADDRESS_REGEX.test(t.propertyAddress) && t.token_price)
    const tokenSupplies = await api.multiCall({ calls: tokens.map((token) => ({ target: token.propertyAddress })), abi: 'erc20:totalSupply' })

    tokenSupplies.forEach((supply, i) => {
      const token = tokens[i]
      const price = parseFloat(token.token_price)
      api.add(ADDRESSES.arbitrum.USDC_CIRCLE, supply * price * Math.pow(10, 6-18))
    })
}

module.exports = {
  methodology: `TVL for Estate Protocol consists of the accumulation of all properties prices, each being tokenSupply * tokenPrice where tokenPrice is given by the API`,
  arbitrum: { tvl }
}
