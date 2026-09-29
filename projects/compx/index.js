async function tvl() {
  return { tether: 0 }; // dead?
}

module.exports = {
  misrepresentedTokens: true,
  algorand: {
    tvl,
  },
};