// Ethereum launch boundaries come from the confirmed creation receipts.
const start = 1795606559
const savingsBlock = 26491934
const lensBlock = 26491943
const savings = '0x9d0d94339707b8Ad977A68d9322Df81791643B7E'
const lens = '0x0E2458bD6A3996373E8eE8B29a58a9f9e4F7B20d'
const wstETH = '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'

async function tvl(api) {
  const block = await api.getBlock()
  if (block < savingsBlock) return
  let units
  if (block < lensBlock) {
    // Before the Lens existed, read pool 0's userUnits exactly as its accountedBalance does.
    // High 128 bits of slot keccak256(abi.encode(uint256(8))) + 2 in the immutable core.
    const word = await api.call({ target: savings, abi: 'function extsload(bytes32) view returns (bytes32)', params: ['0xf3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee5'] })
    units = (BigInt(word) >> 128n).toString()
  } else {
    units = await api.call({ target: lens, abi: 'function accountedBalance(address) view returns (uint256)', params: [wstETH] })
  }
  api.add(wstETH, units)
}

module.exports = {
  methodology: 'Counts the wstETH backing all savings positions once. Excludes treasury reserves, unsolicited transfers, TINE rewards and Uniswap liquidity.',
  doublecounted: true,
  ethereum: { start, tvl },
}
