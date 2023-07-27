const ADDRESSES = require("../helper/coreAssets.json");

const wallets = [
  "0x294ba5f8F1e54f586a9b0a419B189d7b9b9AE33E",
  "0x5aFF01E3A80790c75F15fc6AEBd615c8343d4126",
];

async function tvl(_, _1, _2, { api }) {
  for (const wallet of wallets) {
    for (const key of [
      ...Object.values(ADDRESSES.avax),
      "0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD",
      "0x62edc0692BD897D2295872a9FFCac5425011c661",
    ]) {
      const collateralBalance = await api.call({
        abi: "function balanceOf(address) view returns (uint256)",
        target: key,
        params: [wallet],
      });
      api.add(key, collateralBalance);
    }
  }
}

module.exports = {
  avax: {
    methodology: `Cables Finance is a hybrid DEX, which is utilizing team-provided liquidity to settle trades.  This token liquidity sits in the wallet "0x5aFF01E3A80790c75F15fc6AEBd615c8343d4126" and is therefore the majority of the platform's TVL.  Cables also allows users to create limit orders, which becomes part of the larger orderbook.  These limit order funds are stored in the escrow contract starting with "0x294ba5f8F1e54f586a9b0a419B189d7b9b9AE33E" and are the second portion of the platform's TVL.`,
    tvl,
  },
};
