

const { ethers } = require('ethers');
const allNetworks = [];

function createProvider(name, url, chainId) {
  allNetworks.push([
    name.toUpperCase() + '_RPC',
    url
  ].join('='));
  
  return new ethers.providers.JsonRpcProvider(url,
    {
      name: name,
      chainId: chainId,
    }
  );
}
(async () => {

  const providers = {
    ethereum: createProvider("ethereum", "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", 1),
    bsc: createProvider("bsc", "https://bsc-dataseed4.binance.org", 56),
    polygon: createProvider("polygon", "https://rpc-mainnet.maticvigil.com/", 137),
    heco: createProvider("heco", "https://http-mainnet.hecochain.com", 128),
    fantom: createProvider("fantom", "https://rpc.ftm.tools", 250),
    rsk: createProvider("rsk", "https://public-node.rsk.co", 30),
    tomochain: createProvider("tomochain", "https://rpc.tomochain.com", 88),
    xdai: createProvider("xdai", "https://xdai.poanetwork.dev", 100),
    avax: createProvider("avax", "https://api.avax.network/ext/bc/C/rpc", 43114),
    wan: createProvider("wan", "https://gwan-ssl.wandevs.org:56891", 888),
    harmony: createProvider("harmony", "https://api.s0.t.hmny.io", 1666600000),
    thundercore: createProvider("thundercore", "https://mainnet-rpc.thundercore.com", 108),
    okexchain: createProvider("okexchain", "https://exchainrpc.okex.org", 66),
    optimism: createProvider("optimism", "https://mainnet.optimism.io/", 10),
    arbitrum: createProvider("arbitrum", "https://arb1.arbitrum.io/rpc", 42161),
    kcc: createProvider("kcc", "https://rpc-mainnet.kcc.network", 321),
    celo: createProvider("celo", "https://forno.celo.org", 42220),
  }

  for (var name in providers) {
    const provider = providers[name];
    const start = Date.now();
    const lastBlockNumber = await provider.getBlockNumber();
    const spend = Date.now() - start
    console.log(name, "spend", spend / 1000, "s", "block", lastBlockNumber);
  }
  
  console.log('.env')
  console.log(allNetworks.join("\n"))
})();