const vaultUtils = require("./utils")

async function cronosTVL(timestamp, block, chainBlocks){
  const vaultAddress = "0x66D586eae9B30CD730155Cb7fb361e79D372eA2a"
  return await vaultUtils.tvl(chainBlocks.cronos, 'cronos', vaultAddress)
}

async function dogechainTVL(timestamp, block, chainBlocks){
  const vaultAddress = "0xf5e5271432089254288F47d6F2CFcfE066377900"
  return await vaultUtils.tvl(chainBlocks.dogechain, 'dogechain', vaultAddress)
}

module.exports = {
  doublecounted: true,
  cronos: {
    tvl: cronosTVL,
  },
  dogechain: {
    tvl: dogechainTVL,
  }
};
