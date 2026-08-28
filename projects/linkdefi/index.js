

const VAULT = '0x395ED11a7098Fc8654A064435495D1226eb046Be';

async function tvl(api) {
 
  const [asset, totalAssets] = await Promise.all([
    api.call({ target: VAULT, abi: "address:asset" }),
    api.call({ target: VAULT, abi: "uint256:totalAssets" }),
  ]);


  api.add(asset, totalAssets);
}


module.exports = {
  methodology:
    'Vault TVL Count.',
  base: {
    tvl,
  },
};
