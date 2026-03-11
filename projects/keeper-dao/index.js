const ADDRESSES = require('../helper/coreAssets.json')

const liquidityAbi = {
  "registeredTokens": "function registeredTokens(uint256) view returns (address)",
  "getAllMarkets": "address[]:getAllMarkets",
}

const LIQUIDITY_POOL_CONTRACTS = {
  liquidityPoolContractV3: '0x35fFd6E268610E764fF6944d07760D0EFe5E40E5',
  liquidityPoolContractV4: '0x4F868C1aa37fCf307ab38D215382e88FCA6275E2'
}
const HIDING_VAULT_CONTRACT = '0xE2aD581Fc01434ee426BB3F471C4cB0317Ee672E';
const COMPOUND_COMPTROLLER_ADDRESS = '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B';

// Calculates all the token balances in Hiding Vault NFTs minted till the given block
async function getHidingVaultBalances(api) {
  const nfts = await api.fetchList({  lengthAbi: 'totalSupply', itemAbi: 'tokenByIndex', target: HIDING_VAULT_CONTRACT})
    // all of Compound's supply & borrow assets adresses
    const cTokens  = await api.call(
      {
        target: COMPOUND_COMPTROLLER_ADDRESS,
        abi: liquidityAbi["getAllMarkets"]
      }
    )
    return api.sumTokens({ owners: nfts, tokens: cTokens})
}

// Calculates the token balances in Liquidity Pool Contracts till the given block
async function getLiquidityPoolBalances(api) {
  const pools = Object.values(LIQUIDITY_POOL_CONTRACTS)
  return api.sumTokens({ owners: pools, tokens: [
    ADDRESSES.null,
    ADDRESSES.ethereum.USDC,
    ADDRESSES.ethereum.WETH,
    '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
    ADDRESSES.ethereum.DAI,
  ]})
}

async function tvl(api) {
  await getLiquidityPoolBalances(api);
  await getHidingVaultBalances(api);
}

module.exports = {
  start: '2021-01-30', // 01/30/2021 @ 07:28:23 AM +UTC
  ethereum: {
    tvl
  }
};
