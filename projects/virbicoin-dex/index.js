const { getUniTVL } = require('../helper/unknownTokens');

// Contract addresses
const FACTORY = '0x663B1b42B79077AaC918515D3f57FED6820Dad63';
const MASTERCHEF = '0x12A656c2DeE0EA2685398d52AcF78974fCD67B27';

// LP Tokens
const VBCG_WVBC_LP = '0x3095069E8725402B43E6Ff127750E1246563e48a';
const USDT_WVBC_LP = '0xA67D40496Bd61F9c30efdb040cFCFe6701653d55';

const LP_TOKENS = [VBCG_WVBC_LP, USDT_WVBC_LP];

// VirBiCoin DEX uses uint256 for reserves (no timestamp)
const GET_RESERVES_ABI = 'function getReserves() view returns (uint256 _reserve0, uint256 _reserve1)';

async function pool2(api) {
  // Get LP token balances held by MasterChef
  const lpBalances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: LP_TOKENS.map(lp => ({ target: lp, params: [MASTERCHEF] })),
  });

  // Process each LP with balance > 0
  for (let i = 0; i < LP_TOKENS.length; i++) {
    const lpBalance = lpBalances[i];
    if (!lpBalance || lpBalance === '0') continue;

    const lp = LP_TOKENS[i];

    // Get token0, token1, reserves, and totalSupply
    const [token0, token1, reserves, totalSupply] = await Promise.all([
      api.call({ target: lp, abi: 'address:token0' }),
      api.call({ target: lp, abi: 'address:token1' }),
      api.call({ target: lp, abi: GET_RESERVES_ABI }),
      api.call({ target: lp, abi: 'uint256:totalSupply' }),
    ]);

    // Calculate share of reserves based on LP balance
    const ratio = lpBalance / totalSupply;
    const amount0 = BigInt(Math.floor(Number(reserves._reserve0) * ratio));
    const amount1 = BigInt(Math.floor(Number(reserves._reserve1) * ratio));

    api.add(token0, amount0);
    api.add(token1, amount1);
  }

  return api.getBalances();
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL is calculated by summing the liquidity in all AMM pools (Uniswap V2 fork). Pool2 represents LP tokens staked in the MasterChef contract.',
  virbicoin: {
    tvl: getUniTVL({
      factory: FACTORY,
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
    pool2,
  },
};
