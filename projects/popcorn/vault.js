const sdk = require('@defillama/sdk');
const { BigNumber, constants, utils: ethersutils } = require("ethers");
const utils = require('../helper/utils');

const getVaultsAbi = 'address[]:getRegisteredAddresses';
const getAssetAbi = 'address:asset';
const getTotalAssets = 'uint256:totalAssets';

async function fetch(url) {
    return await utils.fetchURL(url)
    .catch(err => console.log(err, 'err'))
}

async function getTokenPrice(chain, address) {
  const queryString = `${chain}:${address}`;
  const url = `https://coins.llama.fi/prices/current/${queryString}`;
  const result = await fetch(url);
  const parsed = await result.data;
  const token = parsed.coins[`${chain}:${address}`];


  return token?.price && token?.decimals
    ? {
      value: BigNumber.from(Number(token?.price * (10 ** token?.decimals)).toFixed(0)),
      decimals: token.decimals,
    }
    : { value: constants.Zero, decimals: 0 };
}

async function addVaultToTVL(balances, timestamp, chainBlocks, chain = "ethereum", vaultRegistryAddress) {
    const block = chainBlocks[chain];
   const {output: vaultAddresses} = await sdk.api.abi.call({
    target: vaultRegistryAddress,
    params: [],
    chain,
    block,
    abi: getVaultsAbi
  });

  const { output: assets } = await sdk.api.abi.multiCall({
    abi: getAssetAbi,
    calls: vaultAddresses.map(i => ({ target: i})),
    chain,
    block,
  });

  const { output: totalAssets } = await sdk.api.abi.multiCall({
    abi: getTotalAssets,
    calls: vaultAddresses.map(i => ({ target: i})),
    chain,
    block,
  });

  const tokenPrices = await Promise.all(
    assets.map(async asset => await getTokenPrice(chain, asset.output))
  );


  assets.forEach((asset, index) => {
    const totalAssetsTransformed = totalAssets[index].output;
    const priceOfAsset = tokenPrices[index].value;
    const vaultTVL = (priceOfAsset.mul(totalAssetsTransformed)).div(ethersutils.parseUnits('1', tokenPrices[index].decimals));
    sdk.util.sumSingleBalance(balances, asset.output, vaultTVL, chain);
  })

}

module.exports = {
  addVaultToTVL
}