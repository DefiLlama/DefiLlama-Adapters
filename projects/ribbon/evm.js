const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');
const { getChainTransform } = require('../helper/portedTokens');

// Treasury
const treasury = "0xDAEada3d210D2f45874724BeEa03C7d4BBD41674";

// Ethereum Vaults
const ethCallVault = "0x0fabaf48bbf864a3947bdd0ba9d764791a60467a";
const ethCallVaultV2 = "0x25751853Eab4D0eB3652B5eB6ecB102A2789644B";
const wbtcCallVault = "0x8b5876f5B0Bf64056A89Aa7e97511644758c3E8c";
const wbtcCallVaultV2 = "0x65a833afDc250D9d38f8CD9bC2B1E3132dB13B2F";
const usdcETHPutVault = "0x16772a7f4a3ca291C21B8AcE76F9332dDFfbb5Ef";
const yvUSDCETHPutVault = "0x8FE74471F198E426e96bE65f40EeD1F8BA96e54f";
const yvUSDCETHPutVaultV2 = "0xCc323557c71C0D1D20a1861Dc69c06C5f3cC9624";
const aaveCallVault = "0xe63151A0Ed4e5fafdc951D877102cf0977Abd365";
const stETHCallVault = "0x53773E034d9784153471813dacAFF53dBBB78E8c";
const apeCallVault = "0xc0cF10Dd710aefb209D9dc67bc746510ffd98A53";
const rethCallVault = "0xA1Da0580FA96129E753D736a5901C31Df5eC5edf";

// Avalanche Vaults
const avaxCallVault = "0x98d03125c62DaE2328D9d3cb32b7B969e6a87787";
const savaxCallVault = "0x6BF686d99A4cE17798C45d09C21181fAc29A9fb3";
const usdcAvaxPutVault = "0x9DD6be071b4292cc88B8190aB718329adEA3E3a3";

// Treasury Vaults
const perpCallVault = "0xe44eDF7aD1D434Afe3397687DD0A914674F2E405";
const balCallVault = "0x2a6B048eB15C7d4ddCa27db4f9A454196898A0Fe";
const spellCallVault = "0x42cf874bBe5564EfCF252bC90829551f4ec639DC";
const badgerCallVault = "0x270F4a26a3fE5766CcEF9608718491bb057Be238";

// Pausers
const pauserEth = "0xE04e8Ae290965AD4F7E40c68041c493d2e89cDC3";
const pauserAvax = "0xf08d6a9c2C5a2Dc9B8645c5Ac0b529D4046D19aa";

// Ribbon Earn vaults
const rearnUSDC = "0x84c2b16FA6877a8fF4F3271db7ea837233DFd6f0";

// Ethereum Assets
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const wbtc = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const aave = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
const perp = "0xbC396689893D065F41bc2C6EcbeE5e0085233447";
const ape = "0x4d224452801ACEd8B2F0aebE155379bb5D594381";
const bal = "0xba100000625a3754423978a60c9317c58a424e3D";
const reth = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const steth = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
const spell = "0x090185f2135308BaD17527004364eBcC2D37e5F6";
const badger = "0x3472A5A71965499acd81997a54BBA8D852C6E53d";
const wsteth = "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0";
const ldo = "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32";
const rbnWeth = "0xdb44a4a457c87225b5ba45f27b7828a4cc03c112";

// Avalanche Assets
const wavax = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
const savax = "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE";
const usdce = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664";

async function addVaults({ balances, chain, vaults, block, transformAddress = a => a }) {
  const { output: balanceRes } = await sdk.api.abi.multiCall({
    abi: abi.totalBalance,
    calls: vaults.map(i => ({ target: i[1]})),
    chain, block,
  })

  balanceRes.forEach((data, i) => sdk.util.sumSingleBalance(balances, transformAddress(vaults[i][0]), data.output))
}

async function ethTvl(_, block) {
  const balances = {};
  const vaults = [
    // theta vault
    [weth, ethCallVault],
    [weth, ethCallVaultV2],
    [wbtc, wbtcCallVault],
    [wbtc, wbtcCallVaultV2],
    [usdc, usdcETHPutVault],
    [usdc, yvUSDCETHPutVault],
    [usdc, yvUSDCETHPutVaultV2],
    [weth, stETHCallVault],
    [aave, aaveCallVault],
    [ape, apeCallVault],
    [reth, rethCallVault],

    // treasury vault
    [perp, perpCallVault],
    [bal, balCallVault],
    [spell, spellCallVault],
    [badger, badgerCallVault],

  ]
  
  await addVaults({ balances, block, vaults, })
  // pauser holds a variety of coins
  return sumTokens2({ balances, owner: pauserEth, tokens: [nullAddress, usdc, wbtc, steth, aave, ], block, })
}

async function avaxTvl(_, _b, { avax: block }) {
  const balances = {};
  const chain = 'avax'
  const transformAddress = await getChainTransform(chain)
  const vaults = [
    [wavax, avaxCallVault], 
    [savax, savaxCallVault], 
    [usdce, usdcAvaxPutVault], 
  ]

  await addVaults({ balances, chain, block, vaults, transformAddress, })
  return sumTokens2({ balances, owner: pauserAvax, tokens: [nullAddress, savax], chain, block, transformAddress, })
}

/**
 * STAKING
 */
const RBN = "0x6123B0049F904d730dB3C36a31167D9d4121fA6B";
const veRBN = "0x19854C9A5fFa8116f48f984bDF946fB9CEa9B5f7";
const veRBNStaking = staking(veRBN, RBN, "ethereum");

module.exports = {
  ethereum: {
    tvl: ethTvl,
    staking: veRBNStaking,
  },
  avax: {
    tvl: avaxTvl,
  },
};
