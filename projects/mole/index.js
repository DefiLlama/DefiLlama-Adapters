const { calLyfTvl, calLyfTvlAptos, calLyfTvlSui } = require("./lyf");
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { getConfig } = require('../helper/cache')

async function getProcolXMoleAddresses(chain) {
  if (chain == "avax") {
    return (
      await getConfig('xmole',
        "https://raw.githubusercontent.com/Mole-Fi/mole-protocol-xmole/main/.avalanche_mainnet.json"
      )
    );
  }
}
  

async function calxMOLEtvl(chain, block) {
  const xmoleAddresses = await getProcolXMoleAddresses(chain);

  const xmoleTVL = (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.xmoleTotalSupply,
      calls: [
        {
          target: xmoleAddresses["xMOLE"],
        },
      ],
      chain,
    })
  ).output;
  const moleAddress = xmoleAddresses["Tokens"]["MOLE"];
  return { [`${chain}:${moleAddress}`]: xmoleTVL[0].output };
}

// async function avaxTvl(timestamp, ethBlock, chainBlocks) {
//   const lyfTvl = await calLyfTvl('avax', chainBlocks.avax);
//   return {...lyfTvl};
// }

// async function avaxStaking(timestamp, ethBlock, chainBlocks) {
//   return await calxMOLEtvl('avax', chainBlocks.avax);
// }

async function aptosTvl(api) {
  return calLyfTvlAptos(api)
}

async function suiTvl(api) {
  return calLyfTvlSui(api)
}

// run command： node test.js projects/mole/index.js
module.exports = {
  timetravel: false,
  start: '2022-05-29',
  // avax: {
  //   tvl: avaxTvl,
  //   staking: avaxStaking,
  // },
  aptos: { tvl: aptosTvl },
  sui: { tvl: suiTvl }
};
