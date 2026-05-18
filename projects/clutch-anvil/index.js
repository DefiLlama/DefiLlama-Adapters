// Clutch Anvil AMM — multi-chain NFT AMM with borrowing and staking.
// Each market (one per NFT collection) deploys:
//   • token    — ERC20 representing fractional ownership of NFTs
//   • escrow   — holds the token supply backing NFTs held in protocol vaults
//   • ammVault — holds NFT inventory for trustless swap (buy/sell)
//   • loanVault  — holds NFTs posted as collateral for token loans
//   • stakingVault — holds NFTs staked for token rewards
//
// TVL = sum of each market's ERC20 token balance across escrow + ammVault +
//       loanVault + stakingVault (the escrow holds tokens backing all vaulted
//       NFTs; the other vaults may hold additional reserve token balances).

const { sumTokens2 } = require('../helper/unwrapLPs')

const ALL_MARKETS_ABI =
  'function allMarkets() view returns ((uint256 marketId,address collection,uint8 collectionType,address token,address escrow,address ammVault,address loanVault,address stakingVault,address governor,uint256 tokensPerNFT,(uint16 randomFeeBps,uint16 specificFeeBps) fees,bool governanceEnabled)[])'

const config = {
  ethereum: {
    factory: '0xEA095646EC6A56EDbFEe84cCcf23eFCec12566A0',
  },
  apechain: {
    factory: '0x87B62309B6fF4FA184C89919351bEbd3AC11Fc84',
  },
  base: {
    factory: '0x5ef900789a0faa1fDE3e9796441B62b66f0ab2Aa',
  },
}

module.exports = {
  methodology:
    'Counts the total value of ERC20 tokens locked in escrow, AMM vault, loan vault, and staking vault contracts across all markets deployed through the Clutch Anvil AMM factory on Ethereum, Base, and ApeChain.',
}

Object.keys(config).forEach(chain => {
  const { factory } = config[chain]

  module.exports[chain] = {
    tvl: async api => {
      const markets = await api.call({ abi: ALL_MARKETS_ABI, target: factory })

      const tokensAndOwners = []
      markets.forEach(({ token, escrow, ammVault, loanVault, stakingVault }) => {
        // escrow holds the token supply that backs all protocol-managed NFTs
        tokensAndOwners.push([token, escrow])
        // vaults may also hold token reserves
        tokensAndOwners.push([token, ammVault])
        tokensAndOwners.push([token, loanVault])
        tokensAndOwners.push([token, stakingVault])
      })

      return sumTokens2({ api, tokensAndOwners, permitFailure: true })
    },
  }
})
