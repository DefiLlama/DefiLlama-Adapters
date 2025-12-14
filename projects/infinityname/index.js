// InfinityName Contract addresses by DefiLlama chain name
const INFINITYNAME_CONTRACTS = {
  'base': "0x86f6d95E688A5953074C0aBCb0d9d930837E528E",
  'optimism': "0x160F10843389773986F44Db9B64e318c50b7fC7F",
  'bob': "0x86f6d95E688A5953074C0aBCb0d9d930837E528E",
  'soneium': "0x86f6d95E688A5953074C0aBCb0d9d930837E528E",
  'ink': "0x86f6d95E688A5953074C0aBCb0d9d930837E528E",
  'unichain': "0x86f6d95E688A5953074C0aBCb0d9d930837E528E",
}

const sdk = require("@defillama/sdk")

const abi = {
  feeRecipient: "address:feeRecipient",
}

async function tvl(api) {
  const contractAddress = INFINITYNAME_CONTRACTS[api.chain]
  
  if (!contractAddress) {
    throw new Error(`No InfinityName contract found for chain ${api.chain}`)
  }

  // Get fee recipient address
  const feeRecipient = await api.call({
    target: contractAddress,
    abi: abi.feeRecipient,
  })

  // Get native token balance of fee recipient (this represents accumulated domain registration fees)
  const { output: balance } = await sdk.api.eth.getBalance({
    target: feeRecipient,
    chain: api.chain,
    block: api.block,
  })

  // Add native token balance as TVL (represents total fees collected from domain registrations)
  api.addGasToken(balance)
}

// Create exports for each supported chain
const chainExports = {}

Object.keys(INFINITYNAME_CONTRACTS).forEach(chainName => {
  chainExports[chainName] = {
    tvl,
  }
})

module.exports = {
  ...chainExports,
  methodology: 'Fee is calculated as the native token balance of the feeRecipient address, which accumulates domain registration fees from InfinityName domain registrations. This represents the total fees collected by the protocol.',
}

