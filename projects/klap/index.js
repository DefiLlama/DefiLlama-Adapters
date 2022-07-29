const { aaveChainTvl } = require("../helper/aave");
const { getFixBalances } = require("../helper/portedTokens");

async function transformKlaytnAddress() {
  const mapping = {
    "0x5388ce775de8f7a69d17fd5caa9f7dbfee65dfce":
      "0x4576E6825B462b6916D2a41E187626E9090A92c6", // Donkey
    "0x9eaefb09fe4aabfbe6b1ca316a3c36afc83a393f": "ripple", // XRP
    "0x02cbe46fb8a1f579254a9b485788f2d86cad51aa":
      "0x26fb86579e371c7aedc461b2ddef0a8628c93d3b", // bora
    "0x078dB7827a5531359f6CB63f62CFA20183c4F10c":
      "0x6b175474e89094c44da98b954eedeac495271d0f", // dai
    "0x6270B58BE569a7c0b8f47594F191631Ae5b2C86C":
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0x0268dbed3832b87582b1fa508acf5958cbb1cd74":
      "bsc:0xf258f061ae2d68d023ea6e7cceef97962785c6c1", // IJM
    "0xd6dAb4CfF47dF175349e6e7eE2BF7c40Bb8C05A3":
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    "0x168439b5eebe8c83db9eef44a0d76c6f54767ae4":
      "0x6b175474e89094c44da98b954eedeac495271d0f", // pUSD
    "0x4fa62f1f404188ce860c8f0041d6ac3765a72e67":
      "0x6b175474e89094c44da98b954eedeac495271d0f", // KSD
    "0xce40569d65106c32550626822b91565643c07823":
      "0x6b175474e89094c44da98b954eedeac495271d0f", // KASH
    "0x210bc03f49052169d5588a52c317f71cf2078b85":
      "bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56", // kBUSD
    "0xDCbacF3f7a069922E677912998c8d57423C37dfA":
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
    "0xCD6f29dC9Ca217d0973d3D21bF58eDd3CA871a86":
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
    "0xe4f05A66Ec68B54A58B17c22107b02e0232cC817": "0xe4f05a66ec68b54a58b17c22107b02e0232cc817" // Klaytn
  };
  return addr => {
    const mappingResult = mapping[addr]
    addr = addr.toLowerCase();
    return mappingResult || `klaytn:${addr}`;
  };
}

function lending(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const transform = await transformKlaytnAddress();
    const balances = await aaveChainTvl(
      "klaytn",
      "0x969E4A05c2F3F3029048e7943274eC2E762497AB",
      transform,
      undefined,
      borrowed
    )(timestamp, ethBlock, chainBlocks);
    const fixBalances = await getFixBalances('klaytn')
    fixBalances(balances)
    return balances
  };
}

module.exports = {
  timetravel: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  klaytn: {
    tvl: lending(false),
    borrowed: lending(true)
  },
};
