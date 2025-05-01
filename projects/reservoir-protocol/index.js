const ADDRESSES = require('../helper/coreAssets.json')

const config = {
    ethereum: [
        // https://docs.reservoir.xyz/products/proof-of-reserves
        '0x0c7e4342534e6e8783311dCF17828a2aa0951CC7',
        '0x9BB2c38F57883E5285b7c296c66B9eEA4769eF80',
        '0x99A95a9E38e927486fC878f41Ff8b118Eb632b10',
        '0xE45321525c85fcc418C88E606B96daD8cBcc047f',
        '0x841DB2cA7E8A8C2fb06128e8c58AA162de0CfCbC',
        '0x99E8903bdEFB9e44cd6A24B7f6F97dDd071549bc'
        // '0x31Eae643b679A84b37E3d0B4Bd4f5dA90fB04a61', - exluded RUSD because it is project's own token
    ],
  berachain: []
}

Object.keys(config).forEach(chain => {
    if (chain === 'berachain') {
      const byusdHoneyVault = '0xbbB228B0D7D83F86e23a5eF3B1007D0100581613';
      const byusdHoneyToken = '0xdE04c469Ad658163e2a5E860a03A86B52f6FA8C8';
      const honeyToken = '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce';
      const byusdToken = '0x688e72142674041f8f6af4c808a4045ca1d6ac82';

      const owner = '0x0db79c0770E1C647b8Bb76D94C22420fAA7Ac181';
      const kodiakPool = '0xD6D83e479359766f21A63b20d6AF43A138356EbA';

      const lpToken2 = '0x7fd165B73775884a38AA8f2B384A53A3Ca7400E6';
      const rUSDToken = '0x09D4214C03D01F49544C0448DBE3A27f768F2b34';

      const infraredVault = '0x1C5879B75be9E817B1607AFb6f24F632eE6F8820';

      module.exports[chain] = {
        tvl: async (api) => {
          const lpBalance = await api.call({ abi: 'erc20:balanceOf', target: byusdHoneyVault, params: [owner] });
          const honeyBalance = await api.call({ abi: 'erc20:balanceOf', target: honeyToken, params: [owner] });
          const byusdBalance = await api.call({ abi: 'erc20:balanceOf', target: byusdToken, params: [owner] });

          const rUSDBalance = await api.call({ abi: 'erc20:balanceOf', target: rUSDToken, params: [kodiakPool] });
          const honeyBalance2 = await api.call({ abi: 'erc20:balanceOf', target: honeyToken, params: [kodiakPool] });
          const lpToken2TotalSupply = await api.call({ abi: 'erc20:totalSupply', target: lpToken2 });

          const price = (rUSDBalance + honeyBalance2) * 1e8 / lpToken2TotalSupply;
          const balance = await api.call({ abi: 'erc20:balanceOf', target: infraredVault, params: [kodiakPool] });

          api.add(byusdHoneyToken, lpBalance);
          api.add(honeyToken, honeyBalance);
          api.add(byusdToken, byusdBalance);
          api.add(kodiakPool, balance * price / 1e8);

          return api.getBalances();
        }
      }
    }
    else if (chain === 'ethereum') {
      const funds = config[chain]
      module.exports[chain] = {
        tvl: async (api) => {
          const tokens = await api.multiCall({ abi: 'address:underlying', calls: funds })
          const bals = await api.multiCall({ abi: 'uint256:totalValue', calls: funds })
          const decimals = await api.multiCall({ abi: 'uint8:decimals', calls: tokens })
          bals.forEach((v, i) => bals[i] = v * 10 ** (decimals[i] - 18))
          api.add(tokens, bals)
          return api.sumTokens({
            owner: '0x4809010926aec940b550D34a46A52739f996D75D', token: ADDRESSES.ethereum.USDC
          })
        }
      }
    }
})
