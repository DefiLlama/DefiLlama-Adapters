const sui = require("../helper/chain/sui");
const http = require('../helper/http');
const { getEnv } = require('../helper/env')

const endpoint = () => getEnv('SUI_RPC')

async function tvl(api) {
  const vaultData = await sui.getObjects(["0x2d6e81126336685a28ea0637109b570510f988bba2b589877c9b579d3cb8cad8"])

  for (const { fields: { metadata, } } of vaultData) {

    const {
      result: { data: fields }
    } = await http.post(endpoint(), { jsonrpc: "2.0", id: 1, method: 'suix_getDynamicFields', params: [metadata.fields.id.id , null, 48], })
    const fieldObjects = await sui.getDynamicFieldObjects({
      parent: metadata.fields.id.id 
    })

    let i = 0
    for (const field of fields) {
      
      let coin = field.name.value.name
      const amount = fieldObjects[i].fields.balance

      // if pxETH, instead use WETH coin type
      if (coin === "f4530aa5ef8af33c497ec38f54ff9dd45fad9157264efae9693eb62faf8667b5::coin::COIN") {
        coin = "d0e89b2af5e4910726fbcd8b8dd37bb79b29e5f83f7491bca830e94f7f226d29::eth::ETH"
      }
      
      api.add("0x" + coin, amount)
      i++
    }
  }
}

module.exports = {
  // Replacing pxETH with WETH coin, since no price is provided for pxETH.
  // (note that pxETH is equivalent in price to WETH)
  misrepresentedTokens: true,
  timetravel: true,
  sui: {
    tvl,
  },
};
