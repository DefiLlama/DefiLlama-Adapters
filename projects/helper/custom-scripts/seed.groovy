// Seed Job DSL for Custom Scripts
// This seed job creates pipeline jobs for each custom script
// Add new job definitions here as you add more custom scripts

// Configuration
def repoUrl = 'https://github.com/DefiLlama/DefiLlama-Adapters.git'
def defaultBranch = 'main'
def customScriptsPath = 'projects/helper/custom-scripts'

// Create a folder for custom scripts jobs
folder('tvl-custom-scripts') {
    displayName('TVL Scripts')
    description('Jobs for running custom DeFiLlama tvl scripts')
}

// MetaDAO Job
pipelineJob('tvl-custom-scripts/metadao') {
    displayName('MetaDAO TVL')
    description('Calculates Futarchy DAO Treasuries TVL on Solana')

    // Keep last 21 builds
    logRotator {
        numToKeep(21)
    }

    // Build triggers - run every 8 hours
    triggers {
        cron('0 */8 * * *')
    }

    definition {
        cpsScm {
            scm {
                git {
                    remote {
                        url(repoUrl)
                    }
                    branches('main')
                }
            }
            scriptPath("${customScriptsPath}/metadao/jfile")
        }
    }
}