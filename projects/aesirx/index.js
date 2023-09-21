// The main adapter function
async function tvl() {
  // Return the TVL value for $AESIRX (currently zero while contracts will come in Q4 2023)
  return {
    tether: 0,
  };
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  concordium: {
    tvl,
  },
};
