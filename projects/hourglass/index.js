const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')

const ethereum_weeth = '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee';
const ethereum_weethk = '0x7223442cad8e9cA474fC40109ab981608F8c4273';
const ethereum_weeths = '0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88';
const ethereum_lbtcv = '0x5401b8620E5FB570064CA9114fd1e135fd77D57c';
const ethereum_liquidUSD = "0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C";
const ethereum_liquidETH = "0xeA1A6307D9b18F8d1cbf1c3Dd6aad8416C06a221";
const ethereum_liquidETHv2 = "0xf0bb20865277aBd641a307eCe5Ee04E79073416C";
const ethereum_pitchfxs = '0x11ebe21e9d7bf541a18e1e3ac94939018ce88f0b';
const mantle_meth = '0xcDA86A272531e8640cD7F1a92c01839911B90bb0';

const vaults = {
  lbtcv: {
    lockDepositors: [
      "0xA285bca8f01c8F18953443e645ef2786D31ada99",
      "0x80a3A51c8aFa855597EE70d593dD2D83995454f6",
      "0xc8Be25Dd2fF1830F1207243380f767B26379415A",
      "0xf06617fBECF1BdEa2D62079bdab9595f86801604"
    ],
    depositAsset: ethereum_lbtcv,
    pricingToken: ADDRESSES.ethereum.WBTC,
    chain: 'ethereum'
  },
  weETHs: {
    lockDepositors: [
      "0xfbc184950949626dCD1b023AcFF8C84C1b9198A5",
      "0x035D135bF428460Be8E1C19b36e8d4231752da4d"
    ],
    depositAsset: ethereum_weeths,
    pricingToken: ethereum_weeths,
    chain: 'ethereum'
  },
  weETHk: {
    lockDepositors: [
      "0x27027CD9c97C20862F558FB7B5A9964bb152bEc8",
      "0xD573CE999776634d2eDfe310D33382F4f0aa28a2"
    ],
    depositAsset: ethereum_weethk,
    pricingToken: ethereum_weethk,
    chain: 'ethereum'
  },
  weETH: {
    lockDepositors: [
      "0x9522A199503E8Dab5Ec765E4EBB706F7BdcfbF43",
      "0xe8f0613fD627f6914EAED2BE5a3773268125b2D5"
    ],
    depositAsset: ethereum_weeth,
    pricingToken: ethereum_weeth,
    chain: 'ethereum'
  },
  liquidETH: {
    lockDepositors: [
      "0xD7d929DAd6667E28f05796091C75021e0D1a6900",
      "0x43c9ECba97d3294B47babda178bb62104EB9b613",
      "0x3D7Fe7b7b207FB12f01295D402BD4380CCC833DF"
    ],
    depositAsset: ethereum_liquidETH,
    pricingToken: ethereum_liquidETH,
    chain: 'ethereum'
  },
  liquidETHv2: {
    lockDepositors: [
      "0x1ba3ce9d0E6DB041b6818B79Bc101614b17548A1",
      "0x782c84A869486940c849fF94618775e2c1FdB5e4",
      "0x8753F58bD27513c1a8F84937660c2f2e3AAb5b0B"
    ],
    depositAsset: ethereum_liquidETHv2,
    pricingToken: ethereum_weeth,
    chain: 'ethereum'
  },
  liquidUSD: {
    lockDepositors: [
      "0x8AfBf65a76793aE0cD041ed2F26811D952DE6Ee3",
      "0x9284754004Ffe7f68F8969CF2F3C3B86F0802532",
      "0xF11fbb660B9950FeCd38E13B446A28e8605535FC"
    ],
    depositAsset: ethereum_liquidUSD,
    pricingToken: ADDRESSES.ethereum.USDC,
    chain: 'ethereum'
  },
  meth: {
    lockDepositors: [
      "0x37e3aC623B488bB075Ce8F3199ae93F8CAC727F2"
    ],
    depositAsset: mantle_meth,
    pricingToken: mantle_meth,
    chain: 'mantle'
  },
};

const computePitchfxsTvl = async (api) => {
  const balance = await api.call({
    target: ethereum_pitchfxs,
    params: [],
    abi: 'erc20:totalSupply',
  });

  api.addToken(ADDRESSES.ethereum.FXS, balance);
}

function computeTvl(chain) {
  return async (api) => {
    const balances = {};
    const multicallBalances = await api.multiCall({
      calls: Object.values(vaults)
        .filter(vault => vault.chain === chain)
        .map(vault => 
          vault.lockDepositors.map(lockDepositor => ({
            target: vault.depositAsset,
            params: [lockDepositor]
          }))
        )
        .flat(),
      abi: 'erc20:balanceOf',
      withMetadata: true,
    });

    sdk.util.sumMultiBalanceOf(balances, {output: multicallBalances});
    const priceTokens = Object.keys(balances).map(depositAsset => 
      Object.values(vaults).find(vault => vault.depositAsset === depositAsset).pricingToken
    );

    if (chain === 'ethereum') {
      await computePitchfxsTvl(api);
    }
    api.addTokens(priceTokens, Object.values(balances));
  }
}

module.exports = {
  methodology: 'TVL accounts for all assets deposited into our boosted vaults. It also includes the amount of FXS time-locked and minted as pitchFXS.',
  ethereum: {
    tvl: computeTvl('ethereum')
  },
  mantle: {
    tvl: computeTvl('mantle')
  }
}; 
