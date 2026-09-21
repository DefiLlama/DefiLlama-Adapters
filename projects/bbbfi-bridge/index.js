const config = {
  xdc: {
    vault: '0xb0a9379CA1A90CdC7dBCe2558FbAD59cbAF10EfC',
    token: '0x2C0cDA5734dD76c512E05AE0F9397e8a2059c4f4',
    remoteChainId: 56,
    remoteVault: '0xfA730fB268D62FceEB75AD01ab4b016dc413905F',
  },
  bsc: {
    vault: '0xfA730fB268D62FceEB75AD01ab4b016dc413905F',
    token: '0xE7D366A8064232B7EdEFcEA7Fab853EB5cB9CC83',
    remoteChainId: 50,
    remoteVault: '0xb0a9379CA1A90CdC7dBCe2558FbAD59cbAF10EfC',
  },
}

async function tvl(api) {
  const { vault, token, remoteChainId, remoteVault } = config[api.chain]
  await api.getBlock()
  const [actualToken, actualRemoteVault, actualRemoteChain, balance, fees] = await Promise.all([
    api.call({ target: vault, abi: 'address:token' }),
    api.call({ target: vault, abi: 'address:remoteVault' }),
    api.call({ target: vault, abi: 'uint256:remoteChainId' }),
    api.call({ target: token, abi: 'erc20:balanceOf', params: vault }),
    api.call({ target: vault, abi: 'uint256:accruedFees' }),
  ])
  if (actualToken.toLowerCase() !== token.toLowerCase()
    || actualRemoteVault.toLowerCase() !== remoteVault.toLowerCase()
    || Number(actualRemoteChain) !== remoteChainId) throw new Error('BBBFi bridge identity mismatch')

  // Lock/release of pre-existing tokens, not a lock/mint wrapper. Count only
  // reserves still held in these vaults; do not add destination wallet balances,
  // circulating supply, cumulative transfer volume or withdrawable protocol fees.
  const reserve = BigInt(balance) - BigInt(fees)
  api.add(token, reserve > 0n ? reserve.toString() : '0')
}

module.exports = {
  methodology: 'BBB balances held by the XDC and BSC lock/release bridge vaults, less accrued protocol fees. Each chain retains its own token identity for pricing. No minted-wrapper supply, destination wallet balances, cumulative bridge volume or DEX assets are added. Reserve eligibility and protocol-token pricing require DefiLlama review.',
  xdc: { tvl },
  bsc: { tvl },
}
