const ADDRESSES = require('../helper/coreAssets.json')

const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const { sumTokens2 } = require('../helper/unwrapLPs');
const liquidityAbi = require('./abi/liquidity.json');

const LIQUIDITY_POOL_CONTRACTS = {
  liquidityPoolContractV3: '0x35fFd6E268610E764fF6944d07760D0EFe5E40E5',
  liquidityPoolContractV4: '0x4F868C1aa37fCf307ab38D215382e88FCA6275E2'
}
const HIDING_VAULT_START_BLOCK_NUMBER = 12690306;
const HIDING_VAULT_CONTRACT = '0xE2aD581Fc01434ee426BB3F471C4cB0317Ee672E';
const COMPOUND_COMPTROLLER_ADDRESS = '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B';

async function getToken(block, index, liquidityPool) {
  try {
    return (await sdk.api.abi.call({
      block,
      target: liquidityPool,
      params: [index],
      abi: liquidityAbi['registeredTokens'],
    })).output
  } catch (e) { return null}
}

async function getAllTokens(block, liquidityPool) {
  let tokens = []
  for (let i = 0; ; i++) {
    const token = await getToken(block, i, liquidityPool)

    if (!token) {
      break;
    }

    tokens.push(token)
  }

  return tokens;
}

// Calculates all the token balances in Hiding Vault NFTs minted till the given block
async function getHidingVaultBalances(timestamp, block) {
  let hidingVaultBalances = {}

  // Track TVL of Hiding Vaults after it went live
  if (block > HIDING_VAULT_START_BLOCK_NUMBER) {
    // Get total Hiding Vault NFT count by calling totalSupply on Hiding Vault Contract
    // Using erc20 lib as erc721 lib isn't supported yet.
    let noOfHidingVaults = (await sdk.api.erc20.totalSupply({
      target: HIDING_VAULT_CONTRACT,
      block: block
    })).output;

    // numberRange to iterate over indexes of NFTs. Can migrate to any supported util func of erc721 when it is supported.
    const indexRange = [];
    for (let i = 0; i < +noOfHidingVaults; i++)
      indexRange.push(i)

    // Query Hiding Vault Contract's 'tokenByIndex' with index to get individual HidingVaultNFTs
    let totalHidingVaultNFTs = (await sdk.api.abi.multiCall({
      target: HIDING_VAULT_CONTRACT,
      calls: indexRange.map((index) => ({
        params: [index],
      })),
      abi: liquidityAbi['tokenByIndex'],
      block: block
    })).output;

    totalHidingVaultNFTs = totalHidingVaultNFTs.map(hidingVaultNFT => hidingVaultNFT.output);

    // all of Compound's supply & borrow assets adresses
    const { output: cTokens } = await sdk.api.abi.call(
      {
        block,
        target: COMPOUND_COMPTROLLER_ADDRESS,
        params: [],
        abi: liquidityAbi["getAllMarkets"]
      }
    )

    // for each of Compound's cTokens get all of hidingVaultNFT balance and the underlying token address
    await Promise.all(cTokens.map(async (cTokenAddress) => {
      // get the underlying token address
      const isCEth = cTokenAddress.toLowerCase() === "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5"
      const { output: token } = isCEth
        ? { output: ADDRESSES.null } // ETH has no underlying asset on Compound
        : await sdk.api.abi.call(
          {
            block,
            target: cTokenAddress,
            params: [],
            abi: liquidityAbi["underlying"]
          }
        )

      // making a call to get the asset balance for each hidingVaultNFT
      const calls = []

      totalHidingVaultNFTs.forEach(hidingVaultNFT => {
        calls.push({
          target: cTokenAddress,
          params: [hidingVaultNFT]
        })
      })

      const underlyingBalances = await sdk.api.abi.multiCall({
        abi: liquidityAbi["balanceOfUnderlying"],
        calls,
        block,
      });

      // accumulating all our hidingVaultNFT balances to calculate the TVL for this cToken
      const sumTotal = underlyingBalances.output.map(({ output }) => output).reduce((acc, val) => {
        return (new BigNumber(acc).plus(new BigNumber(val))).toString(10)
      }, "0")

      hidingVaultBalances[token] = (new BigNumber(hidingVaultBalances[token] || "0").plus(new BigNumber(sumTotal))).toString(10);
    }));
  }

  return hidingVaultBalances;
}

// Calculates the token balances in Liquidity Pool Contracts till the given block
async function getLiquidityPoolBalances(timestamp, block, api) {
  const toa = []

  await Promise.all(Object.values(LIQUIDITY_POOL_CONTRACTS).map(async liquidityPool => {
    let tokens = await getAllTokens(block, liquidityPool)
    tokens.forEach(i => toa.push([i, liquidityPool]))
  }))
  return toa
}

async function tvl(api) {
  const { timestamp, block } = api
  const tokensAndOwners = await getLiquidityPoolBalances(timestamp, block);
  const balances = await getHidingVaultBalances(timestamp, block);

  return sumTokens2({ api, balances, tokensAndOwners });
}

module.exports = {
  start: '2021-01-30', // 01/30/2021 @ 07:28:23 AM +UTC
  ethereum: {
    tvl
  }
};
