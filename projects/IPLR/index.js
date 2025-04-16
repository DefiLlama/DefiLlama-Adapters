async function tvl() {
  return {
    tether: 1000  // Placeholder for validation
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Test adapter for IPLR. TVL is hardcoded to validate setup.',
  tvl,
};
