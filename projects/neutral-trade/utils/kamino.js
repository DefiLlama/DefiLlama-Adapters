const { get } = require('../../helper/http');

async function getTvl(vaultAddress) {
  const { sharesIssued, tokensPerShare } = await get(`https://api.kamino.finance/kvaults/${vaultAddress}/metrics`);
  const dp = 1e6;
  return sharesIssued * tokensPerShare * dp;
}

module.exports = {
  getTvl
};
