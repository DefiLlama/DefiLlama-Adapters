/**
 * LINE is a price-protected token.
 * It is issued by borrowing against locking a collateral.
 * If the token's price on DEXes grows after borrowing, the user will be able to sell it for profit.
 * If it falls, the user will be able to repay the loan and get their collateral back (less fees).
 * This is what ensures price protection.
 * 
 * @see https://linetoken.org
 *
 */

const { sumUnknownTokens } = require('../helper/unknownTokens');

const LINE_CONTRACT_ADDRESS = "0x31f8d38df6514b6cc3C360ACE3a2EFA7496214f6";
const COLLATERAL_TOKEN_ADDRESS = "0x0b93109d05Ef330acD2c75148891cc61D20C3EF1";

const tvl = async (api) => {
  const LOAN_NFT_CONTRACT_ADDRESS = await api.call({
    abi: "address:loanNFT",
    target: LINE_CONTRACT_ADDRESS,
  });

  return api.sumTokens({
    owners: [LINE_CONTRACT_ADDRESS, LOAN_NFT_CONTRACT_ADDRESS],
    tokens: [COLLATERAL_TOKEN_ADDRESS],
  });
}


const staking = async (api) => {
  const poolAddresses = await api.call({
    abi: "function getAllPools() view returns ((tuple(bool, uint16, uint256, uint256, uint256), address)[])",
    target: LINE_CONTRACT_ADDRESS,
  }).then(allPools => allPools.map(([_, address]) => address));

  return sumUnknownTokens({
    owners: [LINE_CONTRACT_ADDRESS],
    tokens: poolAddresses,
    api, resolveLP: true,
    coreAssets: [COLLATERAL_TOKEN_ADDRESS ]
  });
}

module.exports = {
  methodology: 'The TVL is calculated as USD value of the collateral locked for issuing LINE tokens, staked LP tokens of incentivized pools, and the balances of pending orders on the options market.',
  kava: {
    tvl,
    staking
  }
}