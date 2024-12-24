const DATA_URL = 'https://raw.githubusercontent.com/neutral-trade/vaults-data/main';

const START_TIMESTAMP = 1730419200; // 2024-11-01


const TOKENS = {
  USDC: {
    name: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6
  },
  SOL: {
    name: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9
  },
  WBTC: {
    name: 'Wrapped BTC (Wormhole) (WBTC)',
    mint: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
    decimals: 8
  },
  WETH: {
    name: 'Wrapped ETH (Wormhole) (WETH)',
    mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    decimals: 8
  }
};

const VAULTS = [
  {
    name: "USDC Basis (Perps Basket)",
    address: "4cvgasNfbJ36yeMVJSkscgL2Yco9dFGdj52Wrg91fmHv",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/btcethfunding.json`
  },
  {
    name: "BTC Super Staking",
    address: "BVddkVtFJLCihbVrtLo8e3iEd9NftuLunaznAxFFW8vf",
    token: TOKENS.WBTC,
    dataUrl: `${DATA_URL}/btcjlpnl.json`
  },
  {
    name: "ETH Super Staking",
    address: "ENr5e1BMN5vFUHf4iCCPzR4GjWCKgtHnQcdniRQqMdEL",
    token: TOKENS.WETH,
    dataUrl: `${DATA_URL}/ethjlpnl.json`
  },
  {
    name: "USDC Staking (JLP Delta Neutral) v1",
    //programId: "9Fcn3Fd4d5ocrb12xCUtEvezxcjFEAyHBPfrZDiPt9Qj",
    address: "3Nkctq19AW7gs5hkxixUDjS9UVjmCwcNCo7rqPpub87c",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/jlpdn.json`,
  },
  {
    name: "USDC Staking (JLP Delta Neutral) v2",
    address: "41Y8C4oxk4zgJT1KXyQr35UhZcfsp5mP86Z2G7UUzojU",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/jlpdnv2.json`
  },
  {
    name: "USDC Basis (Sanctum-INF)",
    address: "CxL8eQmGhN9LKSoHj7bU95JekFPtyZoUc57mbehb5A56",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/solbasis.json`
  },
  {
    name: "SOL Super Staking",
    address: "EuSLjg23BrtwYAk1t4TFe5ArYSXCVXLBqrHRBfWQiTeJ",
    token: TOKENS.SOL,
    dataUrl: `${DATA_URL}/soljlpnl.json`
  },
  {
    name: "JLP Traders Print",
    address: "85XuR4kE5yxp1hk91WHAawinXZsuJowxy59STYYpM9pK",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/tradersprint.json`
  },
  {
    name: "JLP Traders Rekt",
    address: "2r81MPMDjGSrbmGRwzDg6aqhe3t3vbKcrYfpes5bXckS",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/tradersrekt.json`
  },
  {
    name: "vip01",
    address: "CZU38L2NyL6tqFxzYAGYkmkf2JG98tZfZ2CnUapVgXQe",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/vip01.json`
  },
  {
    name: "vip02",
    address: "DUW6uWcrsjYmsYDjp9iGDN4JdRa2MqznjuxjKVok5Fsj",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/vip02.json`
  },
  {
    name: "vip03",
    address: "Fd3k4c6Dv7m9673ae87P6duQrftY9UVfwiCxngNbJrUQ",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/vip03.json`
  },
  // 'vip04', // currently inactive
  {
    name: "vip05",
    address: "9BMEyctGvajEubk5iCRBnM9fkeTXUhrxaweYq34jZdC8",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/vip05.json`
  },
  {
    name: "vip06",
    address: "6DFDj66PbPoTC16Sh51MJijoTTMYCbMCVC85tnc5UfQ3",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/vip06.json`
  },
  {
    name: "vip07",
    address: "HTLvAjqc6Wkzh4i4QNLHhQHZAnrtVvkGyYeyCiUWLe9b",
    token: TOKENS.USDC,
    dataUrl: `${DATA_URL}/vip07.json`
  }
];

module.exports = {
  DATA_URL,
  START_TIMESTAMP,
  TOKENS,
  VAULTS,
};
