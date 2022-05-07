const { sumTokensAndLPsSharedOwners, unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const sdk = require("@defillama/sdk");
const windmillABI = require("./windmillABI.json");
const { transformAvaxAddress, transformBscAddress, transformCronosAddress, transformPolygonAddress } = require("../helper/portedTokens");

const config = {
  bsc: {
    windmillContract: "0x0b374F3C618FF06583E7C4a1207bcaF22343737E",
    tokenContract: "0x627E86E9eC832b59018Bf91456599e752288Aa97",
    liquidityContract: "0x1fC3152de89b0c6c36F0d330b7Be369d6dDB219F",
    vaultContract: "0x973Abe726E3e37bbD8501B2D8909Fa59535Babdd",
  }
}
function tvl(chainName) {
  return async ( timestamp, block, chainBlocks ) => {
    const balances = {};
    let transform;
    switch(chainName) {
        case "avax":
           transform = await transformAvaxAddress();
           break;
         case "polygon":
           transform =  await transformPolygonAddress();
           break;
      case "cronos":
        transform =  await transformCronosAddress();
        break;
      default:
        transform = await transformBscAddress();
    };
    const chain = config[ chainName ];
    const totalDeposited = (await sdk.api.abi.call({
      abi: windmillABI.totalBurned,
      chain: chainName,
      target: chain.windmillContract,
      // params: [],
      block: chainBlocks[ chainName ],
    })).output;

    const liquidityBalance = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: chainName,
      target: chain.tokenContract,
      params: chain.liquidityContract,
      block: chainBlocks[ chainName ],
    })).output;

    const treasuryBalance = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: chainName,
      target: chain.tokenContract,
      params: chain.vaultContract,
      block: chainBlocks[ chainName ],
    })).output;

    await sdk.util.sumSingleBalance(balances, transform(config.bsc.tokenContract), totalDeposited);
    await sdk.util.sumSingleBalance(balances, transform(config.bsc.tokenContract), liquidityBalance);
    await sdk.util.sumSingleBalance(balances, transform(config.bsc.tokenContract), treasuryBalance);

    return balances;
  }
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  bsc: {
    tvl: tvl('bsc'),
    treasury:  staking(config.bsc.vaultContract, config.bsc.tokenContract, "bsc"),
  },
  methodology:
    "Counts tokens on the windmill for tvl",
};
