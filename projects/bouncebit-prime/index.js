const { sumTokens } = require('../helper/sumTokens');
const ADDRESSES = require('../helper/coreAssets.json')

const BounceBitGatewayPrime = '0x6f776d791612a22A70e206602cfF96185695C580'

const DEPOSIT_ABI =
  "function totalLocked(address token) view returns (uint256)";

const supportedTokens = {
  ethereum: [ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC],
  bsc: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC]
}

async function tvl(api) {
  const chain = api.chain

  if (supportedTokens[chain]) {
    const calls = supportedTokens[chain].map(address => ({
      target: BounceBitGatewayPrime,
      params: [address]
    }))

    const lockedAmounts = await api.multiCall({
      abi: DEPOSIT_ABI,
      calls
    })

    supportedTokens[chain].forEach((address, i) => {
      api.add(address, lockedAmounts[i])
    })

    return sumTokens({
      api
    })
  }
}

module.exports = {
  methodology: "Deposit tokens via BounceBit Prime counts as TVL",
  ethereum: {
    tvl,
  },
  bsc: {
    tvl,
  }
};
