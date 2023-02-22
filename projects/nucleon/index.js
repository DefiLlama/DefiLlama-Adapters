const sdk = require("@defillama/sdk")
const token = '0x889138644274a7dc602f25a7e7d53ff40e6d0091'
const chain = 'conflux'
const axios = require("axios");
const { BigNumber } = require("ethers");

function stakedValue(target) {
  return async (timestamp, block, chainBlocks) => {
      let supply = {};
      supply = { everscale: (await sdk.api.abi.call({
        target,
          abi: 'erc20:totalSupply',
          block: chainBlocks[chain],
          chain
      })).output / 10 ** 17 };
      let price = (await getCFXPrice());

      supply.everscale = supply.everscale * price;
      
      return supply;
  };
}


async function getCFXPrice() {
  const tokenId = "wrapped-conflux";
  // https://api.coingecko.com/api/v3/simple/price?ids=wrapped-conflux&vs_currencies=usd
  let result;
  let price = 0;
  try {
      result =
          await axios({
              method: "GET",
              url: "https://api.coingecko.com/api/v3/simple/price",
              params: {
                  ids: tokenId,
                  vs_currencies: "usd",
              },
          });
  } catch (e) {
      return price;
  }
  const data = result.data;
  price = data[tokenId].usd;
  return price;
}

module.exports = {
  methodology: 'TVL accounts for XCFX Supply * CFX Price, which represents the amount of CFX staked on the Protocol.',
  conflux: {
    tvl: stakedValue(token, "conflux",() => "wrapped-conflux"),
  },
}
