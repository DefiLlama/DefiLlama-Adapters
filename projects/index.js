const { sumTokens2 } = require('../helper/unwrapLPs');

async function tvl(api) {
  const vault = 'TCL6M2NnQ1Ath5MgYqpRuJBN1zXjuZa5F4';
  const tokens = [
    'TLup8phAShQLmLNxE5RxYPCGtFazpRyvq3',
    'TXYUkE84i2HVf1DVXLLQMZVj2RvQo3CG1y',
    'TB7yVC4dN2kPdQVYUFuHyGLw5XYNsp15L5'
  ];
  return sumTokens2({ owners: [vault], tokens, api });
}

module.exports = {
  methodology: 'TVL is the sum of balances of specified tokens held in the vault contract on BSC.',
  start: 1751001480, // Launch timestamp (Unix epoch): June 27, 2025 14:38:00 UTC
  timetravel: true,
  misrepresentedTokens: false,
  bsc: { tvl },
};
