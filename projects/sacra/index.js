const SACRA_WFTM_POOL = '0x56e837286dc7366ef6d6464d332ac6f9d32bc5a0';
const USDC_WFTM_POOL = '0x3336CbE855625480cf351135F4e27e50aB4af74E';

const config = {
  fantom: {
    controller: '0xe5365c31c08d6ee44fdd33394ba279b85557c449',
    treasury: '0x146dd6e8f9076dfee7be0b115bb165d62874d110',
    token: '0xe4436821E403e78a6Dd62f7a9F5611f97a18f44C',
    fromBlock: 80036087
  }
};

Object.keys(config).forEach(chain => {
  const { controller, treasury, token, fromBlock } = config[chain];

  module.exports[chain] = {
    tvl: async (api) => {
      // Fetch controller balance
      const controllerBalance = (await api.call({
        abi: 'erc20:balanceOf',
        target: token,
        params: [controller],
        fromBlock,
      })) / 10 ** 18;

      // Fetch treasury balance
      const treasuryBalance = (await api.call({
        abi: 'erc20:balanceOf',
        target: token,
        params: [treasury],
        fromBlock,
      })) / 10 ** 18;

      // Fetch slot0 data for SACRA-WFTM pool
      const slot0Sacra = (await api.call({
        target: SACRA_WFTM_POOL,
        abi: abi.slot0,
        fromBlock
      }));

      // Fetch slot0 data for USDC-WFTM pool
      const slot0Wftm = (await api.call({
        target: USDC_WFTM_POOL,
        abi: abi.slot0,
        fromBlock
      }));

      // Calculate SACRA price
      const sacraPrice = await getSacraPrice(slot0Sacra);
      // Calculate FTM price
      const ftmPrice = await getFtmPrice(slot0Wftm);
      // Combined price
      const price = sacraPrice * ftmPrice;

      // Return total value locked
      return {
        'usd-coin': (controllerBalance + treasuryBalance) * price
      }

    }
  };
});

// Function to calculate SACRA price
async function getSacraPrice(slot0) {
  const sqrtPriceX96 = BigInt(slot0[0]);
  const priceSqrt = (sqrtPriceX96 ** 2n);
  const sacraPriceInEth = Number(priceSqrt) / 2 ** 192;
  return 1 / sacraPriceInEth;
}

// Function to calculate FTM price
async function getFtmPrice(slot0) {
  const sqrtPriceX96 = BigInt(slot0[0]);
  const priceSqrt = (sqrtPriceX96 ** 2n);
  const price = Number(priceSqrt) / 2 ** 192;
  return 1 / (price / 10 ** 12);
}

// ABI for the slot0 function
const abi = {
  slot0: "function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
};
