const { addFiraTreasuryPositions } = require("../fira/treasuryHelper");

const owners = [
  '0xF3D913De4B23ddB9CfdFAF955BAC5634CbAE95F4',
  '0xc32e2a2F03d41768095e67b62C9c739f2C2Bc4aA',
  '0x81ad394C0Fa87e99Ca46E1aca093BEe020f203f4',
  '0xe3FD5A2cA538904A9e967CBd9e64518369e5a03f',
  '0xcbf85D44178c01765Ab32Af72D5E291dcd39A06B',
]

async function tvl(api) {
  await addFiraTreasuryPositions(api, owners);
}

module.exports = {
  methodology: "Fira treasury net lending exposure across fixed, variable, and legacy UZR lending markets.",
  ethereum: {
    tvl,
  },
  doublecounted: true,
};
