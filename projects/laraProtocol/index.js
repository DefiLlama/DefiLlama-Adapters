
const { staking } = require('../helper/staking')

// Staking TVLs
const LARA_ADDRESS = '0xE6A69cD4FF127ad8E53C21a593F7BaC4c608945e'
const veLARA_ADDRESS = '0x9c3cEA6d32853D14f0dd641eED2960F1d6D847d8'
const LARA_STAKING_CONTRACT = '0x9B859bEc39B47C8d9C1459046a32d76B1A6883C1'


const stTARA_ADDRESS = '0x37Df886BE517F9c75b27Cb70dac0D61432C92FBE'


const LARA_TREASURY_ADDRESS = '0x9aC436368Ab41b295DC3109C6f27e8C1D0CfDA94'

const laraTotalSupply = async (api) => api.call({
  abi: 'erc20:totalSupply',
  target: LARA_ADDRESS,
  params: [],
});

const laraTreasurySupply = async (api) => api.call({
  abi: 'erc20:balanceOf',
  target: LARA_ADDRESS,
  params: [LARA_TREASURY_ADDRESS],
});

const stTaraSupply = async (api) => api.call({
  abi: 'erc20:totalSupply',
  target: stTARA_ADDRESS,
  params: [LARA_ADDRESS],
});


async function tvl(api) {
  const stTaraSupply = await stTaraSupply(api);

  api.add(stTARA_ADDRESS, stTaraSupply)
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