module.exports = {
  misrepresentedTokens: false,
  hallmarks: [
    ['2026-06-20', 'msUSD depegged after PoR provider termination'],
  ],
  ethereum: { tvl }
}

const MSUSD = '0x4ba01f22827018b4772CD326C7627FB4956A7C00'

async function tvl(api) {
  const supply = await api.call({ abi: 'uint256:totalSupply', target: MSUSD })
  // Reserves are off-chain and unverifiable since the PoR provider dropped Mainstreet on
  // 2026-06-20, and msUSD has traded far below the peg since. Value the supply at msUSD's
  // market price instead of assuming 1:1 USDC backing.
  api.add(MSUSD, supply)
}
