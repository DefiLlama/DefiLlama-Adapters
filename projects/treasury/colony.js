const { nullAddress, treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')
const { mergeExports } = require('../helper/utils');

const CLY = "0xec3492a2508DDf4FDc0cD76F31f340b30d1793e6";

const COLONY_NODE_ID = "NodeID-2iWqUM3VWvrcTLyXi2KgBLVhunMvFW7vY"
const AVALANCHE_P_RPC_URL = "https://api.avax.network/ext/bc/P"

const liquidityProvisionWallet = "0x024b14d4054988600e0C1a35e46B5df40157fd59"
const reserveTreasuryWallet = "0x6E3bb989dffdD8136d8CE78eA5ACA3f1578429F4"

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
    console.log("failed to fetch colony validator data")
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
      ADDRESSES.avax.USDC,
      ADDRESSES.avax.WAVAX,
      "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5", // QI
      "0x48f88a3fe843ccb0b5003e70b4192c1d7448bef0", // CAI
      "0x8af94528fbe3c4c148523e7aad48bcebcc0a71d7", // ATF
      "0xaaab9d12a30504559b0c5a9a5977fee4a6081c6b", // PHAR
      "0x2323dAC85C6Ab9bd6a8B5Fb75B0581E31232d12b", // USDC (DeltaPrime)
      "0xD26E504fc642B96751fD55D3E68AF295806542f5", // WAVAX (DeltaPrime)
      "0x093783055f9047c2bff99c4e414501f8a147bc69", // ALOT
      ADDRESSES.avax.BTC_b,
      ADDRESSES.avax.WETH_e,
      "0xed2b42d3c9c6e97e11755bb37df29b6375ede3eb", // HON
      "0x22d4002028f537599be9f666d1c4fa138522f9c8", // PTP
      "0x449674b82f05d498e126dd6615a1057a9c088f2c", // LOST
      "0x0B2777b0c55AEaAeb56E86B6eEFa6cC2Cfa00e07", // CLY-WAVAX (Trader Joe)
      "0xE5e9d67e93aD363a50cABCB9E931279251bBEFd0", // CAI-WAVAX (Trader Joe)
      "0x997B92C4c9d3023C11A937eC322063D952337236", // CLY-WAVAX (Pangolin)
      "0xEF985c9128f39677c6d4CE2A235B1a2B8c491f39", // CLY-WAVAX (SteakHut)
      "0x078daD8fAC6bef1D83445D41868F6339E8dF269e", // CAI-WAVAX (SteakHut)
    ],
    owners: [liquidityProvisionWallet, reserveTreasuryWallet],
    ownTokens: [CLY],
  },
})

module.exports = mergeExports([module.exports, {
  avax: { tvl }
}])
