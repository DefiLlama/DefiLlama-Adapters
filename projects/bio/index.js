const { cachedGraphQuery } = require('../helper/cache')

// Subgraph endpoint for base chain agent tokens
const BASE_SUBGRAPH_URL = 'https://subgraph.satsuma-prod.com/02e9db8f44e3/8qxl0hc8dpsfpp0yd7egmv/bio-agents-subgraph-mainnet/version/v8.50/api'

// GraphQL query for agent tokens with staking contracts
const GET_AGENT_TOKENS_QUERY = `
  query AgentTokenWithStaking {
    launches(
      where: {
        agentTokenAddress_not: null,
        stakingContractAddress_not: null
      },
      first: 500,
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      launchId
      agentTokenAddress
      stakingContractAddress
    }
  }
`

// Token and staking contract configurations per chain
const config = {
  ethereum: [
    // BIO token staking (veBio)
    { token: '0xcb1592591996765Ec0eFc1f92599A19767ee5ffA', staking: '0xF91a12742Aa609d41513a137d3c36b749F56f40C' },
    // HairDAO
    { token: '0x9Ce115f0341ae5daBC8B477b74E83db2018A6f42', staking: '0xB90F1028266210a007780E6A37D2c36738830F69' },
    // VitaDAO
    { token: '0x81f8f0bb1cB2A06649E51913A151F0E7Ef6FA321', staking: '0x3350153900C0bD8DfDbfE77B274Ac4e49d002588' },
    // AthenaDAO
    { token: '0xA4fFdf3208F46898CE063e25c1C43056FA754739', staking: '0x67CdF8faF53fe5411940caE499799242c6dFCeCc' },
    // ValleyDAO
    { token: '0x761A3557184cbC07b7493da0661c41177b2f97fA', staking: '0xD12E4175619607A39299388D0f8a4233f3121E79' },
    // CryoDAO
    { token: '0xf4308b0263723b121056938c2172868E408079D0', staking: '0x0BB56479c5D9d253E22380ecFe9a2885aa126cCa' },
    // Cerebrum DAO
    { token: '0xab814ce69E15F6B9660A3B184c0B0C97B9394A6b', staking: '0x357d6E1AE7c075984174d2a7E96f6E724ED0Ae7c' },
    // PsyDAO
    { token: '0x2196B84EaCe74867b73fb003AfF93C11FcE1D47A', staking: '0x023c3e7cC97b5d00Bc88B47e068D324FafFB98BE' },
    // Quantum Biology DAO
    { token: '0x3e6a1b21bd267677fa49be6425aebe2fc0f89bde', staking: '0xE41BA1329c76640A5DA6D995bfd1b56A08c52352' },
  ],
  base: [
    // BIO token staking (veBio)
    { token: '0x226A2FA2556C48245E57cd1cbA4C6c9e67077DD2', staking: '0xE1B48C0279Cd95D984f1290293116c45D049A3bD' },
    // HairDAO
    { token: '0x3a38dde9824e18CC4C0A147824F95Bf5d608F0B3', staking: '0xEe8Ea7C133d986b8D9a2708Ef50d83D81fF3b4A1' },
    // VitaDAO
    { token: '0x490a4B510d0Ea9f835D2dF29Eb73b4FcA5071937', staking: '0xCBD956381a12Cc84302344960C95E4AC313845db' },
    // AthenaDAO
    { token: '0x58D75a1c4477914f9a98A8708fEaeD1DbE40b8a3', staking: '0xE01B67eacA87d742638842FcEb9E8C2f006dc29b' },
    // ValleyDAO
    { token: '0x321725ee44cb4bfa544cf45a5a585b925d30a58c', staking: '0x6C85E430Ac13F6e88C83434b7789B969497Ca9f8' },
    // CryoDAO
    { token: '0x1f4446fAAAed23090f324f051C3F8c5ce5aD1c36', staking: '0xe1eA71E1c1Dc3C2492A4D6B7618840d9f1EbE13F' },
    // Cerebrum DAO
    { token: '0x3568c7a4f7545805e379c264303239781B4E9A79', staking: '0x85ecbC26F39fdCA293D76C40Fdd9feADc6a66797' },
    // Aubrai
    { token: '0x9d56c29e820dd13b0580b185d0e0dc301d27581d', staking: '0xAfb64ab91DA6Be665d84016844e5C345399e07D0' },
    // PsyDAO
    { token: '0x85d0e1bde4e71aede97e0f0412c6e4b3d1e59a97', staking: '0x852c11E88478aaFda31950F9E4F4Fe86d9342e53' },
    // BiomeAI
    { token: '0x492AE2107F952b02f2554cE153841933c09d6d43', staking: '0xec637540aE2DA2b795aFe9427B840A827cF72f9a' },
    // EDMT
    { token: '0x7dB6dFE35158bab10039648CE0e0e119d0ec21ec', staking: '0x9dFF3a11F315288cdb100364D6a81088ea9C6A7F' },
    // Additional base tokens are fetched dynamically from subgraph
  ],
}

/**
 * Fetches agent token configurations from the subgraph for base chain
 * @returns {Promise<Array<{token: string, staking: string}>>} Array of token/staking pairs
 */
async function fetchBaseAgentTokens() {
  const result = await cachedGraphQuery(
    'bio-base-agent-tokens',
    BASE_SUBGRAPH_URL,
    GET_AGENT_TOKENS_QUERY
  )

  // Transform subgraph response to internal format
  // Handles both result.data.launches and result.launches formats
  const launches = result?.data?.launches || result?.launches || []

  return launches.map(launch => ({
    token: launch.agentTokenAddress,
    staking: launch.stakingContractAddress
  }))
}

async function tvl(api) {
  let chainConfig = config[api.chain]
  if (!chainConfig) return {}

  // For base chain, append dynamically fetched agent tokens
  if (api.chain === 'base') {
    const dynamicTokens = await fetchBaseAgentTokens()
    chainConfig = [...chainConfig, ...dynamicTokens]
  }

  const tokens = chainConfig.map(c => c.token)
  const calls = chainConfig.map(c => ({ target: c.token, params: [c.staking] }))

  const balances = await api.multiCall({ abi: 'erc20:balanceOf', calls })
  api.addTokens(tokens, balances)
}

module.exports = {
  methodology: 'Calculates TVL by summing token balances in staking/vesting contracts across Ethereum and Base chains',
  ethereum: {
    tvl,
  },
  base: {
    tvl,
  },
}
