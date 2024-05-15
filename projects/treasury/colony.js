const { nullAddress, treasuryExports } = require("../helper/treasury");
const { mergeExports } = require('../helper/utils');

const CLY = "0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6";

const COLONY_NODE_ID = "NodeID-2iWqUM3VWvrcTLyXi2KgBLVhunMvFW7vY"
const AVALANCHE_P_RPC_URL = "https://api.avax.network/ext/bc/P"

async function getValidatorData(nodeId) {
  const response = await fetch(AVALANCHE_P_RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "method": "platform.getCurrentValidators",
      "params": {
        "nodeIDs": [nodeId]
      },
      "id": 1
    })
  })

  if (!response.ok || response.status !== 200) {
    return null
  }

  const responseJson = await response.json()
  if (responseJson.result === undefined || responseJson.result.validators === undefined) {
    return null
  }

  return responseJson.result.validators[0]
}

async function tvl(api) {
  const validator = await getValidatorData(COLONY_NODE_ID)
  if (validator === null) {
    console.log("failed to fetch colony validator data", )
    return api.getBalances()
  }

  const colonyStakeAmount = validator.stakeAmount
  const colonyStakeAmountInWei = colonyStakeAmount * 1e9 // Avalanche P-Chain uses nanoAVAX

  api.add(nullAddress, colonyStakeAmountInWei)

  return api.getBalances()
}

module.exports = treasuryExports({
  avax: {
    tokens: [
      nullAddress,
    ],
    owners: [],
    ownTokens: [CLY],
  },
})

module.exports = mergeExports([module.exports, {
  avax: { tvl }
}])
