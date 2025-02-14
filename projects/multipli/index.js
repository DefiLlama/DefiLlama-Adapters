const BigNumber = require("bignumber.js");
const ethers = require("ethers");
const axios = require("axios")
const { Interface } = require("ethers");
const {toUSDTBalances} = require('../helper/balances')
const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require("../helper/coreAssets.json");


// Replace these with your protocol-specific constants:
const STARK_DEPOSIT_CONTRACT = "0x1390f521A79BaBE99b69B37154D63D431da27A07";
const ETH_ADDRESS = "0x7510780B20799f5daC8b9e5F937Db031d541453C"
const MULTIPLI_DEPOSIT_CONTRACT = "0x5D39456B62d6645DE8fb4556c05a9FF97c10de81"
const BSC_DEPOSIT_CONTRACT = "0xd0ec30e908D16f581417C54be3c6Ff3189AbD259"


const starkexContractABI = require('./starkex_abi.json');
const { sleep } = require("../helper/utils");
const starkexIface = new Interface(starkexContractABI);
const crosschainContractABI = require('./crosschain_abi.json')['abi']
const crosschainIface = new Interface(crosschainContractABI)


async function ethereum_tvl(api) {
  async function fetchTransactionAmount({ api, contract, topic, fromBlock, extraKey, iface, usdcConfig, usdtConfig, ethAddress, isWithdrawal = false }) {
      // Fetch logs
      const logs = await getLogs({
          api,
          target: contract,
          topics: [topic],
          onlyArgs: true,
          fromBlock,
          extraKey,
      });

      const amount = logs.map(log => {
          const parsedLog = iface.parseLog(log);
          const data = {
              assetType: '0x' + parsedLog.args[1].toString(16),
              quantizedAmount: parsedLog.args[3].toString(),
          };

          if (isWithdrawal) {
              data.recipient = parsedLog.args[4].toString(16);
          } else {
              data.depositorEthKey = parsedLog.args[0];
          }

          return data;
      })
      .filter(data => (isWithdrawal ? data.recipient === ethAddress : data.depositorEthKey === ethAddress) && [usdcConfig.stark_asset_id, usdtConfig.stark_asset_id].includes(data.assetType))
      .reduce((acc, data) => acc.plus(data.quantizedAmount), new BigNumber(0));

      return amount.toString() / 10 ** Number(usdcConfig.decimal);
  }

  const coin_config = (await axios.post("https://api.tanx.fi/main/stat/v3/coins/"))

  const usdc_config = coin_config.data.payload.usdc
  const usdt_config = coin_config.data.payload.tether

  // Usage
  const starkDeposit = await fetchTransactionAmount({
      api,
      contract: STARK_DEPOSIT_CONTRACT,
      topic: '0x06724742ccc8c330a39a641ef02a0b419bd09248360680bb38159b0a8c2635d6',
      fromBlock: 12743932,
      extraKey: 'stark-deposit',
      iface: starkexIface,
      usdcConfig: usdc_config,
      usdtConfig: usdt_config,
      ethAddress: ETH_ADDRESS,
  });

  const starkWithdrawal = await fetchTransactionAmount({
      api,
      contract: STARK_DEPOSIT_CONTRACT,
      topic: '0xb7477a7b93b2addc5272bbd7ad0986ef1c0d0bd265f26c3dc4bbe42727c2ac0c',
      fromBlock: 12743932,
      extraKey: 'stark-withdrawal',
      iface: starkexIface,
      usdcConfig: usdc_config,
      usdtConfig: usdt_config,
      ethAddress: ETH_ADDRESS,
      isWithdrawal: true,
  });

  const v1_tvl = starkWithdrawal - starkDeposit


  async function fetchMultipliTransactionAmount({ api, contract, topic, fromBlock, extraKey, iface, usdcConfig, usdtConfig, isWithdrawal = false }) {
      // Fetch logs
      const logs = await getLogs({
          api,
          target: contract,
          topics: [topic],
          onlyArgs: true,
          fromBlock,
          extraKey,
      });

      const amount = logs.map(log => {
          const parsedLog = iface.parseLog(log);
          const data = {
              user: parsedLog.args[0],
              token: parsedLog.args[1],
              quantizedAmount: parsedLog.args[2].toString()
          };

          if (isWithdrawal) {
              data.withdrawalId = parsedLog.args[3].toString();
          }

          return data;
      })
      .filter(data => [usdcConfig.token_contract, usdtConfig.token_contract].includes(data.token) && (!isWithdrawal || data.withdrawalId.includes("US")))
      .reduce((acc, data) => acc.plus(data.quantizedAmount), new BigNumber(0));

      return amount.toString() / 10 ** Number(usdcConfig.decimal);
  }

  // Usage
  const multipliDeposit = await fetchMultipliTransactionAmount({
      api,
      contract: MULTIPLI_DEPOSIT_CONTRACT,
      topic: '0x573284f4c36da6a8d8d84cd06662235f8a770cc98e8c80e304b8f382fdc3dca2',
      fromBlock: 12743932,
      extraKey: 'multipli-eth-deposit',
      iface: crosschainIface,
      usdcConfig: usdc_config,
      usdtConfig: usdt_config,
  });

  const multipliWithdrawal = await fetchMultipliTransactionAmount({
      api,
      contract: MULTIPLI_DEPOSIT_CONTRACT,
      topic: '0xe4f4f1fb3534fe80225d336f6e5a73007dc992e5f6740152bf13ed2a08f3851a',
      fromBlock: 12743932,
      extraKey: 'multipli-eth-withdrawal',
      iface: crosschainIface,
      usdcConfig: usdc_config,
      usdtConfig: usdt_config,
      isWithdrawal: true,
  });


  const v2_multipli_contract_tvl = multipliDeposit - multipliWithdrawal

  return toUSDTBalances(v1_tvl + v2_multipli_contract_tvl)
}

module.exports = {
  ethereum: { tvl: ethereum_tvl },
  // bsc: { tvl: bsc_tvl },

  methodology: `V1 TVL = Σ Withdrawals (from contract to admin wallet) - Σ Deposits (from admin wallet to contract), V2 TVL = Σ Deposits - Σ Withdrawals to and from the contract respectively. The sum of V1 and V2 TVLs is the total TVL of the protocol.`
}


