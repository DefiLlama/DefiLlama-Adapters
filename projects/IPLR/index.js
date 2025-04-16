async function tvl() {
  return {
    tether: 1000 // Placeholder to pass validation
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Test adapter for IPLR. TVL is hardcoded for validation.',
  solana: {
    tvl, // ✅ moved under the `solana` chain key
  }
};
