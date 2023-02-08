const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const abi = require("./abis");
const address = require("./address");

async function getTVL(chain, chainBlocks) {
  const block = chainBlocks[chain];

  const {
    output: [reservesData],
  } = await sdk.api.abi.call({
    target: address.UiPoolDataProvider[chain],
    params: [address.PoolAddressProvider[chain]],
    abi: abi.UiPoolDataProvider.getReservesData,
    block,
    chain,
  });

  const balances = {};

  reservesData
    .filter((d) => d.assetType === "0")
    .forEach((d) => {
      balances["ETHEREUM"] = new BigNumber(balances["ETHEREUM"] || 0).plus(
        new BigNumber(d.availableLiquidity)
          .multipliedBy(d.priceInMarketReferenceCurrency)
          .shiftedBy(-(18 + new BigNumber(d.decimals).toNumber()))
      );
    });

  const NFTPrices = await Promise.all(
    reservesData
      .filter((d) => d.assetType === "1")
      .map(async (data) => {
        const { output: supported } = await sdk.api.abi.call({
          target: address.BNftOracle[chain],
          abi: abi.BNFTOracle.nftPriceFeedMap,
          params: [data.underlyingAsset],
          block,
          chain,
        });
        if (supported) {
          const { output: price } = await sdk.api.abi.call({
            target: address.BNftOracle[chain],
            abi: abi.BNFTOracle.getAssetPrice,
            params: [data.underlyingAsset],
            block,
            chain,
          });
          return new BigNumber(price).gt(data.priceInMarketReferenceCurrency)
            ? price
            : data.priceInMarketReferenceCurrency;
        } else {
          return data.priceInMarketReferenceCurrency;
        }
      })
  );

  reservesData
    .filter((d) => d.assetType === "1")
    .forEach((d, index) => {
      balances["ETHEREUM"] = new BigNumber(balances["ETHEREUM"] || 0).plus(
        new BigNumber(d.availableLiquidity)
          .multipliedBy(NFTPrices[index])
          .shiftedBy(-(18 + new BigNumber(d.decimals).toNumber()))
      );
    });

  const uniV3PosNToken = reservesData.find(
    (data) =>
      data.underlyingAsset.toLowerCase() ===
      address.UniV3Pos[chain].toLowerCase()
  )?.xTokenAddress;

  if (uniV3PosNToken) {
    const uniV3Tvl = await getUniV3Tvl(uniV3PosNToken, chain, block);
    balances["ETHEREUM"] = new BigNumber(balances["ETHEREUM"]).plus(uniV3Tvl);
  }

  return balances;
}

async function getUniV3Tvl(nToken, chain, block) {
  const bal = await sdk.api.erc20.balanceOf({
    target: address.UniV3Pos[chain],
    owner: nToken,
    block,
    chain,
  });

  const tokenIds = (
    await Promise.all(
      new Array(bal).map((_, index) =>
        sdk.api.abi.call({
          target: address.UniV3Pos[chain],
          abi: abi.ERC721.tokenOfOwnerByIndex,
          params: [nToken, index],
          block,
          chain,
        })
      )
    )
  ).map(({ output: tokenId }) => tokenId);

  const uniV3Prices = (
    await Promise.all(
      tokenIds.map((id) =>
        sdk.api.abi.call({
          target: address.UiPoolDataProvider[chain],
          abi: abi.UiPoolDataProvider.getUniswapV3LpTokenData,
          params: [
            address.PoolAddressProvider[chain],
            address.UniV3Pos[chain],
            id,
          ],
          block,
          chain,
        })
      )
    )
  ).map(({ output: data }) => data.tokenPrice);

  return uniV3Prices
    .reduce(
      (pv, cv) => new BigNumber(pv).plus(new BigNumber(cv)),
      new BigNumber(0)
    )
    .shiftedBy(-18);
}

async function getBorrowed(chain, chainBlocks) {
  const block = chainBlocks[chain];

  const {
    output: [reservesData],
  } = await sdk.api.abi.call({
    target: address.UiPoolDataProvider[chain],
    params: [address.PoolAddressProvider[chain]],
    abi: abi.UiPoolDataProvider.getReservesData,
    block,
    chain,
  });

  const balances = {};

  reservesData.forEach((d) => {
    balances["ETHEREUM"] = new BigNumber(balances["ETHEREUM"] || 0).plus(
      new BigNumber(d.totalScaledVariableDebt)
        .multipliedBy(d.variableBorrowIndex)
        .multipliedBy(d.priceInMarketReferenceCurrency)
        .shiftedBy(-(18 + 27 + new BigNumber(d.decimals).toNumber()))
    );
  });

  return balances;
}

module.exports = {
  getTVL,
  getBorrowed,
};
