async function staking() {
  const response = await fetch('https://analytics.dojo.trading/dashboard/ninjaroll/pooltvl');
  const data = await response.json();
  const rollValue = data['ROLL'].tvl;
  return {
    tether: rollValue
  }
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL counts the ROLL tokens staked in the Ninjaroll staking contract",
  injective: { tvl: staking },
};
