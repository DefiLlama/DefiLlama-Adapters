const ADDRESSES = require('../helper/coreAssets.json')
const { get } = require('../helper/http')

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

async function tvl(api) {

  const tokens = (await get('https://realtyx.co:2083/api/public/property/list?chain=' + api.chain)).filter(t => t.contract && EVM_ADDRESS_REGEX.test(t.contract) && t.nowPrice);

  const tokenSupplies = await api.multiCall({ calls: tokens.map((token) => ({ target: token.contract })), abi: 'erc20:totalSupply' });

  tokenSupplies.forEach((supply, i) => {

    const token = tokens[i]

    const price = parseFloat(token.nowPrice);

    switch (api.chain) {
      case "base":
        api.add(ADDRESSES.base.USDC, supply * price * Math.pow(10, 6 - 18))
        break;
      case "plume_mainnet":
        api.add(ADDRESSES.plume_mainnet.pUSD, supply * price * Math.pow(10, 6 - 18))
        break;
      default:
        break;
    }

  })

}


module.exports = {
  methodology: `RealtyX’s TVL is calculated by aggregating the price of all tokenized real-world properties on the platform. For each property, the value is determined by tokenSupply × tokenPrice, where tokenPrice is provided by tokenAPI.`,
  base: { tvl },
  plume_mainnet: { tvl },
}
