// Handshake OTC: firm OTC offers settled on-chain. Each factory creates one board per token pair; a board holds the
// tokens of its open offers in escrow (sell offers the base token, buy offers the quote token) until they are
// taken or cancelled. TVL is what the boards hold.

const factories = {
  ethereum: '0x8308a7c85287b1a0ba6c249b743273e0880244f4',
  arbitrum: '0xfbbc5dfb448aab524d98688fbd76ae54dfd7cc59',
  base: '0xb4b2debbbf362ce795ad993688587bf30cb9f826',
  hyperliquid: '0xb4b2debbbf362ce795ad993688587bf30cb9f826', // HyperEVM
}

// Tokens the coins API cannot price on their own chain, priced as the same token elsewhere. DIME on HyperEVM is the
// DIME Paradex withdraws there (18 decimals on both chains).
const priceAs = {
  hyperliquid: { '0xa72ae85ca2340ff74cc45c423f2a85a062a4fb4c': 'ethereum:0xb32e10022ffbedfe10bc818a1c7e67d9d87e0fa7' },
}

async function tvl(api) {
  const boards = await api.fetchList({ lengthAbi: 'uint256:boardCount', itemAbi: 'function boards(uint256) view returns (address)', target: factories[api.chain] })
  const bases = await api.multiCall({ abi: 'address:base', calls: boards })
  const quotes = await api.multiCall({ abi: 'address:quote', calls: boards })
  const tokensAndOwners = boards.flatMap((board, i) => [[bases[i], board], [quotes[i], board]])
  // Anyone can create a board for any token pair, so a token whose balanceOf reverts counts as zero instead of
  // failing the whole chain.
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokensAndOwners.map(([token, owner]) => ({ target: token, params: owner })), permitFailure: true })
  tokensAndOwners.forEach(([token], i) => {
    const pricedAs = priceAs[api.chain]?.[token.toLowerCase()]
    if (pricedAs) api.add(pricedAs, balances[i] ?? 0, { skipChain: true })
    else api.add(token, balances[i] ?? 0)
  })
}

module.exports = {
  methodology: 'Tokens held in escrow by the Handshake OTC boards: the base tokens of open sell offers and the quote tokens of open buy offers.',
  start: '2026-09-28',
}

Object.keys(factories).forEach((chain) => { module.exports[chain] = { tvl } })
