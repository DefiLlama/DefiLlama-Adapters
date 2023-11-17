const { staking } = require("../helper/staking");

const WETH = "0x4200000000000000000000000000000000000006";
const WIG = "0x58dd173f30ecffdfebcd242c71241fb2f179e9b9";
const vWIG = "0x60c08737877a5262bdb1c1cAC8FB90b5E5B11515";
async function tvl(timestamp, _1, _2, { api }) {
  const totalLockedValue = await api.call({
    abi: "function getTotalValueLocked() public view returns (uint256)",
    target: WIG,
  });
  api.add(WETH, totalLockedValue);
}

module.exports = {
  methodology: `Counts the number of locked WETH in the Toupee Tech Bonding Curve. Staking accounts for the WIG locked in ToupeeTechVoter (0x60c08737877a5262bdb1c1cAC8FB90b5E5B11515)`,
  base: {
    tvl,
    staking: staking(vWIG, WIG),
  },
};
