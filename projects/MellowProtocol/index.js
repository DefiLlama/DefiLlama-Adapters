const sdk = require('@defillama/sdk');
const abi = require("./abi.json");

const ADDRESSES = ['0xB17a8d440c4e0A206Fc1dE76F3D0531F70bF6d42', '0x336ce0084D1aCF7c32578924b13F7abCed47Ac3e', '0x5e6f99876b709E0C8384dd2A7F9F12771E00d240', '0x3AF84EC55b9A696C650C2a7Cab7D2555dbf45892', '0xedF3cb10dE6Ad6449B9F9Ee561f18e50b6B79234', '0x87065A6e0e6609583976404fd33F670FaA310390', '0x6F0e45AA2B7D936F88166F92Be82AB162788Ed9b', '0x02B9f3AfB742Ce533f6d3cc8900b588674C8B795', '0x0c43098E8aF3D3d27555c3FD4cCf62638d269C68', '0xfd89E1274D96884381601D533e8d051bCf20fC71', '0x6D3F5363bB30BB5CAE7F30c74689Ee6a7154350E', '0xC99c70492Bc15c056813d1ddA95C89Bb285Cdc86', '0x6A2Dd3B817F0364e7603e781dDA9c62f62c440E1', '0x78ba57594656400d74a0c5ea80f84750cb47f449', '0xA33a068645E228Db11c42e9d187EDC72361B7BC0', '0x34c277B0c690936168cF436B904B2242a11E7eeA', '0xD3442BA55108d33FA1EB3F1a3C0876F892B01c44', '0xa2607696699dbF3c4de584e244f4E3df58cdf69c', '0x13c7bCc2126d6892eEFd489Ad215A1a09F36AA9f', '0x1FCD3926b6DFa2A90Fe49A383C732b31f1ee54eB'];
const ADDRESSES_POLYGON = ['0x87eF296A29652245Ca13EcE7dF11C17e5a5559df', '0xF44FeC6b2d0dF38106490e34af6dB1Ea2FB42334', '0xDC188Fa71F077Ac39cE5383A73Cb2ea1687409e8', '0x4bAc81e668ac82A0382b987A27bbc5E65c70A64c', '0x37E336D573EC3b05eA55fF80dCD29D619a2A9795', '0xCb555775D73C187bdC8C3082dCac5794Bf0d22BB', '0xEDDA71479f5E889b85bF48BE0eF38255481da4b1', '0x0F07904D2EBcEa8a416174427380406B7251F701'];

async function tvl(_, _1, _2, { api }) {
  const balances = {};

  for (let i = 0; i < ADDRESSES.length; ++i) {

    const balancesVault = await api.call({
      abi: abi.tvl,
      target: ADDRESSES[i],
      params: [],
    });

    const tokens = await api.call({
      abi: abi.vaultTokens,
      target: ADDRESSES[i],
      params: [],
    }); 

    for (let i = 0; i < tokens.length; ++i) {
      if (!(tokens[i] in balances)) {
          balances[tokens[i]] = 0;
      }
      balances[tokens[i]] += Number(balancesVault[1][i]);
    }

  }

  return balances;
}

async function tvlPolygon(_, _1, _2, { api }) {
  const balances = {};

  for (let i = 0; i < ADDRESSES_POLYGON.length; ++i) {

    const balancesVault = await api.call({
      abi: abi.tvl,
      target: ADDRESSES_POLYGON[i],
      params: [],
    });

    const tokens = await api.call({
      abi: abi.vaultTokens,
      target: ADDRESSES_POLYGON[i],
      params: [],
    }); 

    for (let i = 0; i < tokens.length; ++i) {
      const line = "polygon:" + tokens[i];
      if (!(line in balances)) {
          balances[line] = 0;
      }
      balances[line] += Number(balancesVault[1][i]);
    }

  }

  return balances;
}

module.exports = {
  methodology: 'counts the tvl over all Mellow Procotol Root Vaults calling their corresponding tvl functions',
  ethereum: {
    tvl,
  },
  polygon: {
    tvl: tvlPolygon,
  }
}; 