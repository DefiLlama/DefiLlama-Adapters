

const VAULT = '0x806Ea0e218d24410e24533fB68810440E3b618e1';

async function tvl(api) {
 
  const [asset, totalAssets] = await Promise.all([
    api.call({ target: VAULT, abi: "address:asset" }),
    api.call({ target: VAULT, abi: "uint256:totalAssets" }),
  ]);


  api.add(asset, totalAssets);
}


module.exports = {
  methodology:
    'Base Chain Split4626 Vault(0x806E...) TVL Count.',
  base: {
    tvl,
  },
};
