const { sumTokens2 } = require('../helper/unwrapLPs');
const ADDRESSES = require('../helper/coreAssets.json');

const ROUTER_CONTRACT = '0xd35C85FbA82587c15D2fa255180146A046B67237';
const WEDU_CONTRACT = ADDRESSES.occ.WEDU;
const dEDU_CONTRACT = "0x597FFfA69e133Ee9b310bA13734782605C3549b7";
const CHAIN = 'occ';

/**
 * Fetch total supply of dEDU token and add to TVL
 * @param {Object} api - API context
 */
async function addDEDUSupplyToTVL(api) {
  const dEDUSupply = await api.call({
    target: dEDU_CONTRACT,
    abi: 'erc20:totalSupply',
    chain: CHAIN,
  });

  const dEDUValue = await getTokenPairsDEDU(api);

  api.add(WEDU_CONTRACT, BigInt(dEDUSupply) + BigInt(dEDUValue));
}

/**
 * Get other tokens paired in liquidity pools dEDU value
 * @param {Object} api - API context
 * @returns {Promise<Array<[string, string]>>} - List of [token, owner] pairs
 */
async function getTokenPairsDEDU(api) {
  const pairs = await api.call({
    target: ROUTER_CONTRACT,
    abi: 'function pairs() external view returns (address[] memory)',
    chain: CHAIN,
  });

  const reserves = await Promise.all(
    pairs.map(async (pair) => {
      const [token0, token1, [reserve0, reserve1]] = await Promise.all([
        api.call({ target: pair, abi: 'function token0() external view returns (address)', chain: CHAIN }),
        api.call({ target: pair, abi: 'function token1() external view returns (address)', chain: CHAIN }),
        api.call({ target: pair, abi: 'function getReserves() public view returns (uint112, uint112, uint32)', chain: CHAIN }),
      ]);

      return token0.toLowerCase() === dEDU_CONTRACT.toLowerCase() ? reserve0: token1.toLowerCase() === dEDU_CONTRACT.toLowerCase() ? reserve1 : undefined;
    })
  );

  return reserves.filter((reserve) => reserve !== undefined).reduce((acc, reserve) =>  acc + BigInt(reserve), 0n);
}

/**
 * Main TVL function for occ chain
 * @param {Object} api - API context
 */
async function tvl(api) {
  await addDEDUSupplyToTVL(api);
  return sumTokens2({ api, chain: CHAIN});
}

module.exports = {
  methodology: 'TVL is calculated as the total value of dEDU in circulation and other token dEDU values in pair contracts.',
  occ: {
    tvl,
  },
  start: 1736707071,
};
