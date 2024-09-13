require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// Config from environment
const mnemonicPhrase = process.env.MNEMONIC || 'test test test test test test test test test test test junk';
const mnemonicPassword = process.env.MNEMONIC_PASSWORD;
const privateKey = process.env.PRIVATE_KEY;

const accounts = privateKey.length > 0 ? [privateKey] : {
  mnemonic: mnemonicPhrase,
  path: 'm/44\'/60\'/0\'/0',
  initialIndex: 0,
  count: 1,
  passphrase: mnemonicPassword,
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.8.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.8.20',
      },
    ]
  },
  defaultNetwork: "sei",
  networks: {
    sei: {
      url: 'https://evm-rpc.sei-apis.com',
      accounts,
      // gasPrice: 1200000000,
    },
    seitestnet: {
      url: 'https://evm-rpc.arctic-1.seinetwork.io',
      accounts,
      gasPrice: 1200000000,
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 0,
  },
  etherscan: {
    apiKey: {
      seitestnet: "0000000000000000000000000000000000",
    },
    customChains: [
      {
        network: "seitestnet",
        chainId: 713715,
        urls: {
          apiURL: "https://seitrace.com/api/",
          browserURL: "https://seitrace.com/"
        }
      },
    ]
  },
};
