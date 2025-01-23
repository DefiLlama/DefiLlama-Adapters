const { sumTokens2 } = require("../helper/unwrapLPs");

const CRO_ZKEVM_MOONLANDER_ADDR = '0x02ae2e56bfDF1ee4667405eE7e959CD3fE717A05';

function tvl({moonlander,}) {
    return async (api) => {
        const poolTokens = await api.call({
            abi: abis.totalValue,
            target: moonlander, 
        })

        const addresses = [];
        const valuesUsd = [];

        poolTokens.forEach((poolToken) => {
            addresses.push(poolToken.tokenAddress);
            valuesUsd.push(poolToken.valueUsd);
        });

        return sumTokens2({ api, owner: moonlander, tokens: addresses, balances: valuesUsd})
    }
}

const abis = {
    totalValue: 'function totalValue() view returns (tuple(address tokenAddress, int256 value, uint8 decimals, int256 valueUsd, uint16 targetWeight, uint16 feeBasisPoints, uint16 taxBasisPoints, bool dynamicFee)[])'
}

module.exports = {
    cronos_zkevm: {
      tvl: tvl({ moonlander: CRO_ZKEVM_MOONLANDER_ADDR, }),
    },
  }