const abi = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accCyfPerShare, uint16 depositFeeBP)';
const {addFundsInMasterChef} = require('../helper/masterchef')

const STAKING_CONTRACT = "0xaB0141F81b3129f03996D0679b81C07F6A24c435";
const cyf = "0x411491859864797792308723Fc417f11BbA18D1b"
const pool2s = [
  "0x8dcb95A8CD13A734A470A1808a2472bD6B3A7A56",
    "0x3437Bf22e261c79328e3B91a1F299e057fA12Cb6",
    "0x0e79B2F73461D682174b00e676b68237eF8583F7",
    "0x60ef780FB54373088b93db6600BbBAA90Eb14243"
]

const avaxTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = addr => 'avax:'+addr;
  await addFundsInMasterChef(balances, STAKING_CONTRACT, chainBlocks.avax, 'avax', transformAddress, abi, [
    cyf,
    ...pool2s
  ])

  return balances;
};

module.exports = {
  hallmarks: [
    [1631318400, "Rug Pull"]
  ],
  avax:{
    tvl: avaxTvl,
  },
  methodology:
    "We add the tvl from the farming pools fetching from StakingContract",
};
