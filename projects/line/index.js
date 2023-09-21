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

const { formatUnits } = require('ethers/lib/utils');
const { sumUnknownTokens } = require('../helper/unknownTokens');

export const LINE_CONTRACT_ADDRESS = "0x31f8d38df6514b6cc3C360ACE3a2EFA7496214f6";
export const COLLATERAL_TOKEN_ADDRESS = "0x0b93109d05Ef330acD2c75148891cc61D20C3EF1";

const tvl = async (_, _1, { kava: block }, { api }) => {
  const LOAN_NFT_CONTRACT_ADDRESS = await api.call({
    abi: "address:loanNFT",
    target: LINE_CONTRACT_ADDRESS,
  });

  const ORACLE_CONTRACT_ADDRESS = await api.call({
    abi: "address:oracle",
    target: LINE_CONTRACT_ADDRESS,
  });

  const lineTotalSupply = await api.call({
    abi: "uint256:totalSupply",
    target: LINE_CONTRACT_ADDRESS,
  });

  const linePriceInCollateral = await api.call({
    abi: "uint256:getPrice",
    target: ORACLE_CONTRACT_ADDRESS,
  });


  // const price = BigInt(linePriceInCollateral) / 10n ** 18n;
  // console.log('price', formatUnits(linePriceInCollateral, 18));
  // console.error('line price', typeof linePriceInCollateral, linePriceInCollateral * lineTotalSupply / 1e18);

  const lineTVL = formatUnits(BigInt(lineTotalSupply) * BigInt(linePriceInCollateral), 18);

  const result = await api.sumTokens({
    owners: [LINE_CONTRACT_ADDRESS, LOAN_NFT_CONTRACT_ADDRESS],
    tokens: [COLLATERAL_TOKEN_ADDRESS],
  });

  console.log('api', api._network);
  
  const key = `${api.chain}:${COLLATERAL_TOKEN_ADDRESS}`;
  result[key] = (BigInt(result[key]) + BigInt(Math.trunc(lineTVL))).toString();

  return result;
}


const staking = async (_, _1, { kava: block }, { api }) => {
  const poolAddresses = await api.call({
    abi: "function getAllPools() view returns (tuple[](tuple(bool, uint16, uint256, uint256, uint256), address))",
    target: LINE_CONTRACT_ADDRESS,
  }).then(allPools => allPools.map(([_, address]) => address));

  return sumUnknownTokens({
    owners: [LINE_CONTRACT_ADDRESS],
    tokens: poolAddresses,
    api, resolveLP: true,
    coreAssets: [COLLATERAL_TOKEN_ADDRESS]
  });
}

module.exports = {
  methodology: 'The TVL is calculated as USD value of the collateral locked for issuing LINE tokens, staked LP tokens of incentivized pools, and the balances of pending orders on the options market.',
  kava: {
    tvl,
    staking
  }
}