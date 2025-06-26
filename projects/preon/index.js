//preon
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  arbitrum: {
    ownerTokens: [
      [["0xe50fa9b3c56ffb159cb0fca61f5c9d750e8128c8"], "0xA2Ce28868A852f4B01903B5de07d4835feFe9086"], // aArbWETH
      [["0x8ffdf2de812095b1d19cb146e4c004587c0a0692"], "0x8AD15574A87e30061f24977faaA2d99bC45A3169"], // aArbLUSD - PSM
      [[ADDRESSES.arbitrum.WSTETH], "0x58F046c5374E9cF942b8Eeb056126Ce86dD63EEB"], // wstETH
    ],
  },
  polygon: {
    ownerTokens: [
      [["0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97"], "0x82CD73E9cc96cC12569D412cC2480E4d5962AfF5"], // aPolWMatic
      [["0xEA1132120ddcDDA2F119e99Fa7A27a0d036F7Ac9"], "0x8105Fc3487F117982Eb5A5456D8639b0353242d8"], // aPolSTMATIC
      [["0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE"], "0xdc4552609a3f673f0b72958f678d4a48d0e94ebd"], // aPolDAI
    ],
  },
  base: {
    ownerTokens: [
      [[ADDRESSES.base.WETH], "0xEfaA597277Ce531e52018d42224aB579Bbe31a04"], // aeroAMO
    ],
  },
};

const extraConfig = {
  polygon: [
    {
      token: "0xcd78A20c597E367A4e478a2411cEB790604D7c8F", // Balancer maticX-WMATIC Stable Pool
      owner: "0x67f9ea7675773026706d5b817ad9aecb1a7ba530", // Strategy
      gauge: "0x39EE6Fb813052E67260A3F95D3739B336aABD2C6", // Balancer maticX-WMATIC Stable Pool Aura Deposit Vault
    },
  ],
};

async function tokenTvl(api) {
  return await sumTokens2({ api, ...config[api.chain] });
}

async function customTvl(api) {
  if (Object.keys(extraConfig).includes(api.chain)) {
    await Promise.all(
      extraConfig[api.chain].map(async ({ token, owner, gauge }) => {
        const balance = await api.call({
          abi: "function balanceOf(address) external view returns (uint256)",
          target: gauge,
          params: [owner],
        });

        api.add(token, balance);
      })
    );
  }
}

async function baseTvl(api) {
  const aeroAMO = '0xEfaA597277Ce531e52018d42224aB579Bbe31a04'
  const [amountWeth, _amountOETH] = await api.call({ 
    abi: 'function getPositionPrincipal() view returns (uint256, uint256)', 
    target: aeroAMO 
  })
  api.add(ADDRESSES.base.USDC, amountWeth)
  return api.getBalances()
}

async function tvl(api) {
  if (api.chain === 'base') {
    return baseTvl(api)
  }
  await Promise.all([tokenTvl, customTvl].map((fn) => fn(api)));
}

module.exports = {
  methodology: "Adds up the total value locked as collateral, as well as the AMO positions on Preon Finance",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
});
