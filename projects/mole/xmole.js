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

module.exports = {
  calxMOLEtvl,
}