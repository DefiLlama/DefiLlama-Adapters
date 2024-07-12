const sdk = require("@defillama/sdk");
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, sumTokensExport } = require("../helper/unwrapLPs");

const USDC = ADDRESSES.airdao.USDC.toLowerCase();
const SAMB = ADDRESSES.airdao.SAMB.toLowerCase();
const BOND = ADDRESSES.airdao.BOND.toLowerCase();

const airdaoUSDC = "airdao:" + USDC;
const airdaoSAMB = "airdao:" + SAMB;
const airdaoBOND = "airdao:" + BOND;

const bondTellers = ["0x04B07dFBB78d32FF500466c35B4Fe5D615cbe911", "0x8d4439F8AC1e5CCF37F9ACb527E59720E0ccA3E3"];

async function tvl(api) {
  const balances = await sumTokens2({ owners: bondTellers, tokens: [BOND, SAMB, USDC], api, });

  const tokenMapping = {};
  tokenMapping[airdaoBOND] = "amber";
  tokenMapping[airdaoSAMB] = "amber";
  tokenMapping[airdaoUSDC] = "usd-coin";

  Object.keys(balances).forEach(token => {
    if (tokenMapping[token]) {
      const currentBalance = balances[token];
      delete balances[token];
      sdk.util.sumSingleBalance(balances, tokenMapping[token], currentBalance / 1e18);
    }
  });
  const directAMB = await sdk.api.eth.getBalances({targets: bondTellers, chain: api.chain});
  directAMB.output.forEach(amb => {
    sdk.util.sumSingleBalance(balances, "amber", amb.balance / 1e18)
  })
  return balances;
}

module.exports = {
  airdao: { tvl },
  methodology: `The TVL of Kosmos is equal to the total value of underlying assets locked in the BondTellers contracts.`,
};
