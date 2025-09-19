const axios = require("axios")

const STAKING_VAULT = "0xc92fe84368fc3ff40713792c750709501fcfc4869f120755fd0bea5cac1ead94"
const ALKIMI_DECIMALS = 9n
const ALKIMI_COINGECKO_ID = "alkimi-2"

async function getObject(id) {
  const resp = await axios.post("https://fullnode.mainnet.sui.io:443", {
    jsonrpc: "2.0",
    id: 1,
    method: "sui_getObject",
    params: [id, { showContent: true }],
  })
  return resp.data.result?.data?.content?.fields
}

module.exports = async function staking() {
  const balances = {}
  const fields = await getObject(STAKING_VAULT)

  if (fields) {
    const total = BigInt(fields.balance || "0")
    balances[ALKIMI_COINGECKO_ID] = Number(total / 10n ** ALKIMI_DECIMALS)
  }
  return balances
}
