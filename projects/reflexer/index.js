/*==================================================
  Modules
  ==================================================*/

const sdk = require("../../sdk");

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  // WETH ERC20 contract
  const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

  // Contract holding all of the WETH balance in the system
  const ethCollateralJoin = "0x2D3cD7b81c93f188F3CB8aD87c8Acc73d6226e3A";

  const balance = (
    await sdk.api.erc20.balanceOf({
      target: weth,
      owner: ethCollateralJoin,
      block,
    })
  ).output;

  return { [weth]: balance };
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: "Reflexer",
  token: "RAI",
  category: "lending",
  start: 1613520000,
  tvl,
};
