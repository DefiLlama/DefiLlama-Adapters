const ADDRESSES = require('../helper/coreAssets.json');

const tokenOwners = [
  '0x0db79c0770E1C647b8Bb76D94C22420fAA7Ac181',
  '0x6811742721DcCe83942739d44E40f140B5BCee37',
  '0x8Cc5a546408C6cE3C9eeB99788F9EC3b8FA6b9F3',
  '0x5563CDA70F7aA8b6C00C52CB3B9f0f45831a22b1',
  '0x4809010926aec940b550D34a46A52739f996D75D'
];

const config = {
  ethereum: {
    tokens: [
      ADDRESSES.ethereum.USDC,
      '0xb7de5dfcb74d25c2f21841fbd6230355c50d9308'
    ],
    fundAdapters: [
      // https://docs.reservoir.xyz/products/proof-of-reserves
      '0x0c7e4342534e6e8783311dCF17828a2aa0951CC7',
      '0x9BB2c38F57883E5285b7c296c66B9eEA4769eF80',
      '0x99A95a9E38e927486fC878f41Ff8b118Eb632b10',
      '0xE45321525c85fcc418C88E606B96daD8cBcc047f',
      '0x841DB2cA7E8A8C2fb06128e8c58AA162de0CfCbC',
      '0x99E8903bdEFB9e44cd6A24B7f6F97dDd071549bc'
      // '0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61', - exluded RUSD because it is project's own token
    ],
    lps: []
  },
  berachain: {
    tokens: [
      '0xdE04c469Ad658163e2a5E860a03A86B52f6FA8C8',
      '0x549943e04f40284185054145c6E4e9568C1D3241',
      ADDRESSES.berachain.HONEY,
      '0x688e72142674041f8f6af4c808a4045ca1d6ac82',
      '0x7fd165b73775884a38aa8f2b384a53a3ca7400e6',
      '0x1fb6c1ade4f9083b2ea42ed3fa9342e41788d4b5'
    ],
    fundAdapters: [],
    lps: [
      {
        name: 'BYUSD-HONEY-STABLE',
        token: '0xdE04c469Ad658163e2a5E860a03A86B52f6FA8C8',
        vault: '0xbbB228B0D7D83F86e23a5eF3B1007D0100581613',
        holder: '0x0db79c0770E1C647b8Bb76D94C22420fAA7Ac181'
      },
      {
        name: 'rUSD-HONEY',
        token: '0x7fd165B73775884a38AA8f2B384A53A3Ca7400E6',
        vault: '0x1C5879B75be9E817B1607AFb6f24F632eE6F8820',
        holder: '0x6811742721DcCe83942739d44E40f140B5BCee37'
      },
      {
        name: 'rUSD-USD₮0',
        token: '0x1fb6c1aDE4F9083b2EA42ED3fa9342e41788D4b5',
        vault: '0xc6De36eceD67db9c17919708865b3eE94a7D987C',
        holder: '0x8Cc5a546408C6cE3C9eeB99788F9EC3b8FA6b9F3'
      }
    ]
  }
};

async function calculateLPPosition(api, lp) {
  const { token, vault, holder } = lp;

  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: vault,
    params: [holder]
  });

  api.add(token, balance);
}

async function calculateFundAdaptersPositions(api, fundAdapters) {
  const tokens = await api.multiCall({
    abi: 'address:underlying',
    calls: fundAdapters
  });
  const bals = await api.multiCall({
    abi: 'uint256:totalValue',
    calls: fundAdapters
  });
  const decimals = await api.multiCall({
    abi: 'uint8:decimals',
    calls: tokens
  });
  bals.forEach((v, i) => (bals[i] = v * 10 ** (decimals[i] - 18)));
  api.add(tokens, bals);
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      // Add fund adapters
      await calculateFundAdaptersPositions(api, config[chain].fundAdapters);

      // Add LPs
      await Promise.all(
        config[chain].lps.map(async (lp) => await calculateLPPosition(api, lp))
      );

      // Add token holdings
      return api.sumTokens({
        tokens: config[chain].tokens,
        owners: tokenOwners
      });
    }
  };
});
