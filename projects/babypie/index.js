const { sumTokensExport } = require("../helper/sumTokens.js");
const bitcoinAddressBook = require("../helper/bitcoin-book/index.js");

const mBtcTokenAddresses = {
  ethereum: "0xbDf245957992bfBC62B07e344128a1EEc7b7eE3f",
  bsc: "0x7c1cca5b25fa0bc9af9275fb53cba89dc172b878",
  arbitrum: "0x2172fAD929E857dDfD7dDC31E24904438434cB0B",
  zircuit: "0x7FdFbE1fB9783745991CFb0a3D396acE6eE0c909",
  hemi: "0x0Af3EC6F9592C193196bEf220BC0Ce4D9311527D",
};

async function tvl(api) {
  const mBtcTokenAddress = mBtcTokenAddresses[api.chain];
  if (!mBtcTokenAddress) throw new Error(`Unsupported chain: ${api.chain}`);

  let totalSupplyRaw, lockedmBTCInBridge;

  if (api.chain === "ethereum") {
    [totalSupplyRaw, lockedmBTCInBridge] = await Promise.all([
      api.call({
        abi: "uint256:totalSupply",
        target: mBtcTokenAddress,
      }),
      api.call({
        abi: "function balanceOf(address) view returns (uint256)",
        target: mBtcTokenAddress,
        params: ['0xc4995816b5421b88f85b5abfbe24fd218d56c676'],
      }),
    ]);
    api.add(mBtcTokenAddress, totalSupplyRaw - lockedmBTCInBridge);
  } else {
    totalSupplyRaw = await api.call({
      abi: "uint256:totalSupply",
      target: mBtcTokenAddress,
    });
    api.add(mBtcTokenAddress, totalSupplyRaw);
  }
}

module.exports = {
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.magpie }),
  },
  ethereum: { tvl },
  bsc: { tvl },
  arbitrum: { tvl },
  zircuit: { tvl },
  hemi: { tvl },
};
