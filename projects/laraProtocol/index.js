
const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

// Staking TVLs
const LARA_ADDRESS = '0xE6A69cD4FF127ad8E53C21a593F7BaC4c608945e'
const LARA_STAKING_CONTRACT = '0x9B859bEc39B47C8d9C1459046a32d76B1A6883C1'
const STTARA_ADDRESS = '0x37Df886BE517F9c75b27Cb70dac0D61432C92FBE'

const stTaraSupply = async (api) => api.call({
  abi: 'erc20:totalSupply',
  target: STTARA_ADDRESS,
  params: [],
});


async function tvl(api) {
  const stTara = await stTaraSupply(api);

  api.add(ADDRESSES.null, stTara);
}


module.exports = {
    start: 11378044,
    tara: {
      tvl,
      staking: staking(LARA_STAKING_CONTRACT, LARA_ADDRESS)
    },
    hallmarks: [
      [1719575745, "Lara TGE"],
      [1731690920, "Lara Staking Launch"],
      [1737462486, "Taraxa Liquid Staking launch"],
    ]
};