const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { stakings } = require("../helper/staking");
const TROVE_FACTORY_CONTRACT = '0x3bB7fFD08f46620beA3a9Ae7F096cF2b213768B3'
const ALBT = '0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0' // Ethereum version of AllianceBlock Token
const BEUR = '0x338Eb4d394a4327E5dB80d08628fa56EA2FD4B81'.toLowerCase() // BEUR Token pegged to the Euro
const BNQ = '0x91eFbe97e08D0ffC7d31381c032D05FAd8E25aAA' // BONQ Utility Token
const BNQ_STAKING_CONTRACT = '0xb1b72B3579b03dFdCfF3195486277605e55Cf703'
const BNQ_BEUR_UNIV3_POOL = '0xA96373C7a591fd21b86E0c9b8E156CC81E6cBb5e'
const TOKEN_COLLATERAL = [
  ADDRESSES.polygon.WMATIC_2, // WMATIC
  ADDRESSES.polygon.USDC, // USDC
  '0x35b2ece5b1ed6a7a99b83508f8ceeab8661e0632', // WALBT (Wrapped AllianceBlock Token)
  ADDRESSES.polygon.WETH_1, // WETH
  ADDRESSES.polygon.DAI, // DAI
]
const LP_COLLATERAL = [
  '0xa1dd21527c76bb1a3b667149e741a8b0f445fae2', // Arrakis Vault V1 BEUR/DAI
  '0x388e289a1705fa7b8808ab13f0e0f865e2ff94ee'  // Arrakis Vault V1 USDC/BEUR
]

const abi = {
  getUnderlyingBalances: 'function getUnderlyingBalances() public view returns (uint256 amount0Current, uint256 amount1Current)',
  totalCollateral: 'function totalCollateral(address _token) external view returns (uint256)',
}

async function getPairTVL(balances, contract, api) {
  const [
    uBals, lpBal, totalSupply, token0, token1,
  ] = await Promise.all([
    api.call({ abi: abi.getUnderlyingBalances, target: contract, }),
    api.call({ target: TROVE_FACTORY_CONTRACT, params: contract, abi: abi.totalCollateral, }),
    api.call({ target: contract, abi: 'erc20:totalSupply', }),
    api.call({ abi: 'address:token0', target: contract, }),
    api.call({ abi: 'address:token1', target: contract, }),
  ])

  const ratio = lpBal / totalSupply
  if (token0.toLowerCase() !== BEUR)
    sdk.util.sumSingleBalance(balances, token0, uBals[0] * ratio, api.chain)
  if (token1.toLowerCase() !== BEUR)
    sdk.util.sumSingleBalance(balances, token1, uBals[1] * ratio, api.chain)
}

async function tvl(api) {
  const balances = {};

  const tokenUnderlying = await api.multiCall({
    target: TROVE_FACTORY_CONTRACT,
    calls: TOKEN_COLLATERAL,
    abi: abi.totalCollateral,
  });
  tokenUnderlying.forEach((e, index) => {
    // use ALBT price from Ethereum, WALBT not available on Coingecko
    if (TOKEN_COLLATERAL[index] === '0x35b2ece5b1ed6a7a99b83508f8ceeab8661e0632') {
      return sdk.util.sumSingleBalance(balances, ALBT, e);
    }
    return sdk.util.sumSingleBalance(balances, TOKEN_COLLATERAL[index], e, api.chain);
  })

  await Promise.all(LP_COLLATERAL.map(i => getPairTVL(balances, i, api)))

  return balances;
}

module.exports = {
  hallmarks: [
    [1675252800,"Oracle Hack"]
  ],
  deadFrom: '2023-02-01',
  methodology: 'Summation of the collateral deposited in BonqDAO Troves (personal lending vaults)',
  polygon: {
    tvl,
    staking: stakings([BNQ_STAKING_CONTRACT], BNQ),
    // pool2: stakings([BNQ_BEUR_UNIV3_POOL], [BEUR, BNQ])
  }
};
