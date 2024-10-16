
const ITP_VAULT_ADDRRESS= '0x23371aEEaF8718955C93aEC726b3CAFC772B9E37'
const ITP_ON_OPTIMISM = "0x0a7B751FcDBBAA8BB988B9217ad5Fb5cfe7bf7A0";
const VELO_PRICE_ORACLE = "0x395942C2049604a314d39F370Dfb8D87AAC89e16";
const WETH_TOKEN_ADDRESS = "0x4200000000000000000000000000000000000006";
const VELO_TOKEN_ADDRESS = "0x3c8b650257cfb5f272f799f5e2b4e65093a11a05";
const OP_TOKEN_ADDRESS = "0x4200000000000000000000000000000000000042";
const USDC_OP_TOKEN_ADDRESS = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85";
const ITP_STAKED_ABI = "function getVaultInfo() view returns (uint256, uint256, uint256, uint256, uint256, uint256[], uint256)";

const getStakedTVL = async (api) => {
  const { chain } = api
  let stakedTVL = 0;
  if(chain === 'optimism'){
    const fetchVeloPrice = await api.call( {
      abi: "function getManyRatesWithConnectors(uint8, address[]) view returns (uint256[] memory rates)",
      target: VELO_PRICE_ORACLE,
      params: [
        1,
        [
          ITP_ON_OPTIMISM,
          VELO_TOKEN_ADDRESS,
          WETH_TOKEN_ADDRESS,
          OP_TOKEN_ADDRESS,
          USDC_OP_TOKEN_ADDRESS,
        ],
      ],
    })
    const price = parseInt(fetchVeloPrice[0]) / Math.pow(10, 18)
  
    const stakedBalance = await api.call({
      abi: ITP_STAKED_ABI,
      target: ITP_VAULT_ADDRRESS,
    });
    const staked =  parseInt(stakedBalance[0]) / Math.pow(10, 18)
    stakedTVL = staked * price
  }
  api.addUSDValue(stakedTVL)
}

module.exports = {
  optimism: {
    tvl: () => ({}),
    staking: getStakedTVL
  },
}
