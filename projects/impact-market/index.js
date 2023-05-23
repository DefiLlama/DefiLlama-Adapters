const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const PACTTokenAddress = "0x46c9757C5497c5B1f2eb73aE79b6B67D119B0B58"
const CELOTokenAddress = ADDRESSES.celo.CELO
const ARITokenAddress = "0x20677d4f3d0F08e735aB512393524A3CfCEb250C"

const pactDelegatorContract = "0x8f8BB984e652Cb8D0aa7C9D6712Ec2020EB1BAb4"

async function treasury(timestamp, ethBlock, {celo: block}) {
    const chain = "celo"
    const balances = {}

    const treasuryCELO = await sdk.api.erc20.balanceOf({
      target: CELOTokenAddress,
      owner: pactDelegatorContract,
      chain: chain,
      block: block
    })

    const treasuryARI = await sdk.api.erc20.balanceOf({
      target: ARITokenAddress,
      owner: pactDelegatorContract,
      chain: chain,
      block: block
    })

    sdk.util.sumSingleBalance(balances, "celo", Number(treasuryCELO.output)/1e18)
    sdk.util.sumSingleBalance(balances, "ari-swap", Number(treasuryARI.output)/1e18)
    return balances;
}

async function staking(timestamp, ethBlock, {celo: block}) {
    const chain = "celo"
    const balances = {}

    const lockedPACT = await sdk.api.erc20.balanceOf({
      target: PACTTokenAddress,
      owner: pactDelegatorContract,
      chain: chain,
      block: block
    })

    sdk.util.sumSingleBalance(balances, "impactmarket", Number(lockedPACT.output)/1e18)
    return balances;
}

module.exports={
    celo: {
        treasury,
        staking,
        tvl: () => ({})
    }
}
