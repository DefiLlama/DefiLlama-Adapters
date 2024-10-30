const sdk = require("@defillama/sdk");

async function tvl(api) {
  const vaults = {
    ethereum: [
      "0x9847c14fca377305c8e2d10a760349c667c367d4",
      "0x349c996c4a53208b6eb09c103782d86a3f1bb57e",
    ],
    polygon: [
      "0xe7fe898a1ec421f991b807288851241f91c7e376",
      "0xa02aa8774e8c95f5105e33c2f73bdc87ea45bd29",
    ]
  }[api.chain];

  const tokens = await api.multiCall({
    abi: 'address:asset',
    calls: vaults,
  });

  const bals = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: vaults,
  });

  tokens.forEach((token, i) => {
    api.add(token, bals[i]);
  });
}

module.exports = {
  doublecounted: true,
  methodology: "Counts total value locked in ERC4626 vaults",
  ethereum: { tvl },
  polygon: { tvl },
};
