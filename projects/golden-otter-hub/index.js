const ADDRESSES = require('../helper/coreAssets.json')

const GOLDEN_OTTER = '0x57268aFa4E496684611aAFB1E20D2116283C487e';
const STAKING_CONTRACT = '0xc631A1A2E53984b461556b030A532BB83Bf49aEb';

// GOTR/WLD DexScreener
const PAIR_GOTR_WLD = '0xccbbace82078705cab7f49b22fbdebfc3eb58840';

const tvl = async (api) => {
  // Fetch the balance of GOTR tokens in the staking contract
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: GOLDEN_OTTER,
    params: [STAKING_CONTRACT],
  });
  const reserves = await api.call({
    abi: 'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    target: PAIR_GOTR_WLD,
  });

  // Assign reserves to variables (token0 = WLD, token1 = GOTR)
  const reserveWLD = reserves[0];
  const reserveGOTR = reserves[1];

  // Calculate the GOTR/WLD exchange rate: how many WLD per 1 GOTR
  const priceGOTRtoWLD = reserveWLD / reserveGOTR;

  // Convert the GOTR balance to its value in WLD
  const calculateValueToWLD = balance * priceGOTRtoWLD;

  api.add(ADDRESSES.wc.WLD, calculateValueToWLD);
}

module.exports = {
  methodology: 'Count TVL by counting the balance of the token in the staking contract and calculating its value in WLD based on the reserves of the GOTR/WLD pair.',
  wc: {
    tvl: tvl
  }
};
