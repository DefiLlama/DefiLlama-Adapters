const WETH = "0x4200000000000000000000000000000000000006"
const WIG = "0x58dd173f30ecffdfebcd242c71241fb2f179e9b9";
async function tvl(timestamp, _1, _2, { api }) {
  const totalLockedValue = await api.call({
    abi: "function getTotalValueLocked() public view returns (uint256)",
    target: WIG,
  });
  api.add(WETH, totalLockedValue);
}

module.exports = {
  methodology: `Counts the number of locked WETH in the Toupee Tech Bonding Curve`,
  base: {
    tvl,
  },
};
