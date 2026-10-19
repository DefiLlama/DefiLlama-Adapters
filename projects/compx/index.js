async function tvl() {
  return { tether: 0 }; // dead?
}

module.exports = {
  deadFrom: "2025-01-01",
  misrepresentedTokens: true,
  algorand: {
    tvl,
  },
};