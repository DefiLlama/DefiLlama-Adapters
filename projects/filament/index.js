const { sumTokensExport } = require("../helper/unwrapLPs");

const USDC_CONTRACT = '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1';
const FILAMENT_VAULT_CONTRACT = '0xbeB6A6273c073815eBe288d2dF4e5E8bc027DA11';
const FILAMENT_DEPOSIT_CONTRACT = '0x894DE0011C0d69BCa2e19c21CD246C17A8A4252e';

module.exports = {
  sei: {
    tvl: sumTokensExport({ owners: [FILAMENT_VAULT_CONTRACT, FILAMENT_DEPOSIT_CONTRACT], tokens: [USDC_CONTRACT] }),
  },
}
