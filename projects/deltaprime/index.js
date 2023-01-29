const sdk = require('@defillama/sdk');
const { ethers } = require("ethers");

const VFDepositTokenBalanceAbi = require('./abis/VFDepositTokenBalanceAbi.json');
const VFDepositTokenAbi = require('./abis/VFDepositTokenAbi.json');
const getAllOwnedAssetsAbi = require('./abis/getAllOwnedAssetsAbi.json');
const getAllLoansAbi = require('./abis/getAllLoansAbi.json');
const getPoolHelperAbi = require('./abis/getPoolHelperAbi.json');

const assetToAddressMapping = require('./mappings/assetToAddressMapping.json')

const USDC_POOL_TUP_CONTRACT = '0x2323dAC85C6Ab9bd6a8B5Fb75B0581E31232d12b';
const WAVAX_POOL_TUP_CONTRACT = '0xD26E504fc642B96751fD55D3E68AF295806542f5';
const SMART_LOANS_FACTORY_TUP = '0x3Ea9D480295A73fd2aF95b4D96c2afF88b21B03D';
const VF_MAINSTAKING_CONTRACT = "0x8B3d9F0017FA369cD8C164D0Cc078bf4cA588aE5";

// Fetch current poolHelper contract address for a given asset from VF MainStaking contract
async function getVFVaultAddress(asset, chainBlocks){
  return (await sdk.api.abi.call({
    abi: getPoolHelperAbi,
    chain: 'avax',
    target: VF_MAINSTAKING_CONTRACT,
    params: [asset],
    block: chainBlocks['avax'],
  })).output.helper;
}

// Get VF vault depositToken balance
async function getVFDepositTokenBalance(token, account, chainBlocks) {
  return (await sdk.api.abi.call({
    abi: VFDepositTokenBalanceAbi,
    chain: 'avax',
    target: token,
    params: [account],
    block: chainBlocks['avax'],
  })).output;
}

// Get deposit token of a given VF vault
async function getVFDepositToken(vault, chainBlocks) {
  return (await sdk.api.abi.call({
    abi: VFDepositTokenAbi,
    chain: 'avax',
    target: vault,
    params: [],
    block: chainBlocks['avax'],
  })).output;
}

// Fetch all PrimeAccount contracts from the SmartLoansFactory contract
async function getAllPrimeAccounts(chainBlocks) {
  return (await sdk.api.abi.call({
    abi: getAllLoansAbi,
    chain: "avax",
    target: SMART_LOANS_FACTORY_TUP,
    params: [],
    block: chainBlocks["avax"]
  })).output;
}

// Get USDC lending pool balance
async function getUsdcPoolBalance(chainBlocks) {
  return (await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    chain: "avax",
    target: assetToAddressMapping["USDC"],
    params: [USDC_POOL_TUP_CONTRACT],
    block: chainBlocks["avax"]
  })).output;
}

// Get WAVAX lending pool balance
async function getWavaxPoolBalance(chainBlocks) {
  return (await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    chain: "avax",
    target: assetToAddressMapping["AVAX"],
    params: [WAVAX_POOL_TUP_CONTRACT],
    block: chainBlocks["avax"]
  })).output;
}

// Get balances of tokens owned by a PrimeAccount
async function getStandardTokensBalances(ownedAssets, account, chainBlocks) {
  return  await sdk.api.abi.multiCall({
    calls: ownedAssets.map(token => ({
      target: token,
      params: [account]
    })),
    abi: "erc20:balanceOf",
    withMetadata: true,
    chain: "avax",
    block: chainBlocks["avax"]
  });
}

// Sum lending pools balances
async function sumLendingPoolBalances(balances, chainBlocks, transform){
  const usdPoolBalance = await getUsdcPoolBalance(chainBlocks);
  sdk.util.sumSingleBalance(balances, transform(assetToAddressMapping["USDC"]), usdPoolBalance)

  const wavaxPoolBalance = await getWavaxPoolBalance(chainBlocks);
  sdk.util.sumSingleBalance(balances, transform(assetToAddressMapping["AVAX"]), wavaxPoolBalance)
}

async function getPrimeAccountOwnedAssets(account, chainBlocks) {
  let ownedAssets = (await sdk.api.abi.call({
    abi: getAllOwnedAssetsAbi,
    chain: "avax",
    target: account,
    params: [],
    block: chainBlocks["avax"]
  })).output;
  return ownedAssets.map((asset) => {return assetToAddressMapping[ethers.utils.parseBytes32String(asset)]})
}

async function calculateSupportedTokensValue(account, chainBlocks, balances, transform) {
  let ownedAssets = await getPrimeAccountOwnedAssets(account, chainBlocks);
  const tokensBalancesMulticallResponse = await getStandardTokensBalances(ownedAssets, account, chainBlocks);

  tokensBalancesMulticallResponse.output.forEach((tokenBalanceResult, i) => {
    const valueInToken = tokenBalanceResult.output;
    sdk.util.sumSingleBalance(balances, transform(ownedAssets[i]), valueInToken);
  });
}

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  const transform = (address) => `avax:${address}`;

  const VF_USDC_CONTRACT = await getVFVaultAddress(assetToAddressMapping["USDC"], chainBlocks);
  const VF_WAVAX_CONTRACT = await getVFVaultAddress(assetToAddressMapping["AVAX"], chainBlocks);
  const VF_SAVAX_CONTRACT = await getVFVaultAddress(assetToAddressMapping["sAVAX"], chainBlocks);

  const VF_USDC_DEPOSIT_TOKEN = await getVFDepositToken(VF_USDC_CONTRACT, chainBlocks);
  const VF_WAVAX_DEPOSIT_TOKEN = await getVFDepositToken(VF_WAVAX_CONTRACT, chainBlocks);
  const VF_SAVAX_DEPOSIT_TOKEN = await getVFDepositToken(VF_SAVAX_CONTRACT, chainBlocks);

  let primeAccounts = await getAllPrimeAccounts(chainBlocks);

  // Calculate TVL of lending pools
  await sumLendingPoolBalances(balances, chainBlocks, transform)

  // Calculate TVL of PrimeAccounts
  for(const account of primeAccounts){
    await calculateSupportedTokensValue(account, chainBlocks, balances, transform);

    // Calculate value of VectorFinance vaults
    for(const [vaultContract, depositTokenContract] of [
      [VF_USDC_CONTRACT, VF_USDC_DEPOSIT_TOKEN],
      [VF_WAVAX_CONTRACT, VF_WAVAX_DEPOSIT_TOKEN],
      [VF_SAVAX_CONTRACT, VF_SAVAX_DEPOSIT_TOKEN]
    ]) {
      let balance = await getVFDepositTokenBalance(vaultContract, account, chainBlocks);
      sdk.util.sumSingleBalance(balances, transform(depositTokenContract), balance)
    }
  }

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'Counts TVL of DeltaPrime\'s lending pools and individual PrimeAccount contracts\'',
  start:
    24753316,
  avax: {
    tvl,
  }
}; // node test.js projects/deltaprime/index.js
