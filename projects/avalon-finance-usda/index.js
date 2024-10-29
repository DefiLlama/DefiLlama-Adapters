const abi = {
    "getPoolManagerReserveInformation": "function getPoolManagerReserveInformation() view returns (tuple(uint256 userAmount, uint256 collateral, uint256 debt,uint256 claimableBTC) poolManagerReserveInfor)",
}

const config = {
    ethereum: {
        poolAddress: '0x3f390dD6EF69f68f9877aACC086856a200808693',
        fbtcAddress: '0xC96dE26018A54D51c097160568752c4E3BD6C364',
        usdaAddress: '0x0b4D6DA52dF60D44Ce7140F1044F2aD5fabd6316',
    },
    bsc: {
        poolAddress: '0xC757E47d6bC20FEab54e16F2939F51Aa4826deF7',
        fbtcAddress: '0xC96dE26018A54D51c097160568752c4E3BD6C364',
        usdaAddress: '0x8a4bA6C340894B7B1De0F6A03F25Aa6afb7f0224',
    },
    mantle: {
        poolAddress: '0x8f778806CBea29F0f64BA6A4B7724BCD5EEd543E',
        fbtcAddress: '0xC96dE26018A54D51c097160568752c4E3BD6C364',
        usdaAddress: '0x2BDC204b6d192921605c66B7260cFEF7bE34Eb2E',
    },
}

const getMetrics = async (api, borrowed) => {
    const { poolAddress, usdaAddress } = config[api.chain]
    const marketData = await api.call({ abi: abi.getPoolManagerReserveInformation, target: poolAddress, });

    // const marketDebt = marketData.debt;
    // const marketCollateral = marketData.collateral;
    if (borrowed) {
        // USDa is the debt token
        const totalDebt = await api.call({ abi: 'erc20:totalSupply', target: usdaAddress });
        api.add(usdaAddress, totalDebt);
    } else {
        // LFFBTC is the collateral
        const collateral = await api.call({ abi: 'erc20:balanceOf', target: config[api.chain].fbtcAddress, params: config[api.chain].poolAddress });
        api.add(config[api.chain].fbtcAddress, collateral);
    }
}

module.exports = {
  methodology: `LFFBTC as collateral and USDa as debt. USDa is the stablecoin.`,
  ethereum: {
    tvl: (api) => getMetrics(api, false),
    borrowed: (api) => getMetrics(api, true),
  },
  bsc: {
    tvl: (api) => getMetrics(api, false),
    borrowed: (api) => getMetrics(api, true),
  },
  mantle: {
    tvl: (api) => getMetrics(api, false),
    borrowed: (api) => getMetrics(api, true),
  },
}

delete module.exports.bitcoin
