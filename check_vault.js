const ethers = require('ethers');

async function check() {
  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org/');

  const vault = '0x132376b153d3cFf94615fe25712DB12CaAADf547';
  const cobtc = '0x918b3aa73e2D42D96CF64CBdB16838985992dAbc';

  const vaultAbi = ['function asset() view returns (address)', 'function totalAssets() view returns (uint256)', 'function totalSupply() view returns (uint256)'];
  const erc20Abi = ['function symbol() view returns (string)', 'function decimals() view returns (uint8)', 'function name() view returns (string)', 'function totalSupply() view returns (uint256)'];

  const vaultContract = new ethers.Contract(vault, vaultAbi, provider);
  const cobtcContract = new ethers.Contract(cobtc, erc20Abi, provider);

  try {
    const asset = await vaultContract.asset();
    const totalAssets = await vaultContract.totalAssets();
    const totalSupply = await vaultContract.totalSupply();
    const symbol = await cobtcContract.symbol();
    const decimals = await cobtcContract.decimals();
    const name = await cobtcContract.name();
    const cobtcTotalSupply = await cobtcContract.totalSupply();

    console.log('Vault asset():', asset);
    console.log('CoBTC symbol:', symbol);
    console.log('CoBTC name:', name);
    console.log('CoBTC decimals:', decimals);
    console.log('CoBTC total supply:', cobtcTotalSupply.toString());
    console.log('Vault total assets:', totalAssets.toString());
    console.log('Vault total supply:', totalSupply.toString());
    console.log('Asset matches CoBTC?', asset.toLowerCase() === cobtc.toLowerCase());

    // Check if it's really 1:1 pegged
    const ratio = Number(totalAssets) / Number(totalSupply);
    console.log('Vault ratio (assets/supply):', ratio);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

check();
