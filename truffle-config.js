const HDWalletProvider = require("@truffle/hdwallet-provider");
require('dotenv').config();

module.exports = {
    networks: {
        development: {
            provider: function() { 
                return new HDWalletProvider(
                       process.env.MNEMONIC,
                       `http://localhost:8545`
                   );
               },
            // host: "localhost",
            // port: 8545,
            network_id: "1631066815323"
        },
        rinkeby: {
            provider: function() { 
             return new HDWalletProvider(
                    process.env.MNEMONIC,
                    `https://rinkeby.infura.io/v3/${process.env.INFURA_ID}`
                );
            },
            network_id: 4,
            gas: 4500000,
            gasPrice: 10000000000,
        },
        okextest: {
            provider: function() { 
                return new HDWalletProvider(
                    process.env.MNEMONIC,
                    'https://exchaintestrpc.okex.org'
                );
            },
            network_id: 65,
            gas: 4500000,
            gasPrice: 10000000000,
            networkCheckTimeout: 1000000,
            timeoutBlocks: 2000,
        },
        test: {
            host: "localhost",
            port: 8545,
            network_id: "*"
        },
        mainnet: {
            provider: function() {
                return new HDWalletProvider(
                    process.env.MNEMONIC,
                    `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`
                )
            },
            network_id: 1
        },
        kovan: {
            provider: function() {
                return new HDWalletProvider(
                    process.env.MNEMONIC,
                    `https://kovan.infura.io/v3/${process.env.INFURA_ID}`
                )
            },
            network_id: 42
        }
    },

    compilers: {
        solc: {
            version: "0.6.12",
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },

    plugins: [
        'truffle-plugin-verify'
    ],

    api_keys: {
        etherscan: process.env.ETHERSCAN_API_KEY
    }
};
