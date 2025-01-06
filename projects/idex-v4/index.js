const axios = require('axios')

const USDC = '0xfbda5f676cb37624f28265a144a48b0d6e87d3b6'
const owner = '0xF0b08bd86f8479a96B78CfACeb619cfFeCc5FBb5'

const tvl = async (api) => {
  const url = `https://xchain-explorer.idex.io/api/v2/smart-contracts/${USDC}/query-read-method`;
  const headers = {
    accept: 'application/json',
    'Content-Type': 'application/json'
  };

  const payload = {
    args: [owner],
    method_id: "70a08231", // balanceOf method
    from: USDC,
    contract_type: "proxy"
  };

  const { data } = await axios.post(url, payload, { headers })
  api.addUSDValue(data.result.output[0].value / 1e6)
}

module.exports = {
  idex: { tvl }
}