const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abis = require("./abis.js");
const BigNumber = require("bignumber.js");

const USDC_ADDRESS = ADDRESSES.ethereum.USDC;
const RE_NFT = "0x502818ec5767570F7fdEe5a568443dc792c4496b";
const INVARIA2222 = "0x10a92B12Da3DEE9a3916Dbaa8F0e141a75F07126";

const toUSDCBalaces = (amount, unitPrice) => ({
    [USDC_ADDRESS] : BigNumber(amount).dp(0, BigNumber.ROUND_DOWN).times(unitPrice).toFixed(0)
});

async function tvl(timestamp, block) {
  const stakingNFTs = (await sdk.api.abi.call({
      block,
      target: RE_NFT,
      abi: abis.balanceOf,
      params: [INVARIA2222, 1],
    })).output;

  const nftUnitPrice = (await sdk.api.abi.call({
    block,
    target: RE_NFT,
    abi: abis.SellingPrice,
  })).output;

  return toUSDCBalaces(stakingNFTs, nftUnitPrice);
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Counts the number of staking nfts time the unit price of nft",
  ethereum: {
    tvl,
  },
  start: 15389792,
};
