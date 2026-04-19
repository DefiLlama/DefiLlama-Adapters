const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");

// Vaultfire Protocol — AI Agent Trust Infrastructure
// TVL = native tokens staked in AI Partnership Bonds + AI Accountability Bonds
// across Base, Avalanche, Arbitrum, and Polygon.

const bondContracts = {
  base: [
    "0x01C479F0c039fEC40c0Cf1c5C921bab457d57441", // AIPartnershipBonds
    "0x6750D28865434344e04e1D0a6044394b726C3dfE", // AIAccountabilityBonds
  ],
  avax: [
    "0xDC8447c66fE9D9c7D54607A98346A15324b7985D", // AIPartnershipBonds
    "0x376831fB2457E34559891c32bEb61c442053C066", // AIAccountabilityBonds
  ],
  arbitrum: [
    "0xdB54B8925664816187646174bdBb6Ac658A55a5F", // AIPartnershipBonds
    "0xef3A944f4d7bb376699C83A29d7Cb42C90D9B6F0", // AIAccountabilityBonds
  ],
  polygon: [
    "0x83dd216449B3F0574E39043ECFE275946fa492e9", // AIPartnershipBonds
    "0xdB54B8925664816187646174bdBb6Ac658A55a5F", // AIAccountabilityBonds
  ],
};

function tvl(api) {
  const owners = bondContracts[api.chain];
  return sumTokens2({ api, owners, tokens: [nullAddress] });
}

module.exports = {
  methodology:
    "TVL is the total value of native tokens (ETH, AVAX, MATIC) staked in Vaultfire AI Partnership Bonds and AI Accountability Bonds across all supported chains.",
  base: { tvl },
  avax: { tvl },
  arbitrum: { tvl },
  polygon: { tvl },
};
