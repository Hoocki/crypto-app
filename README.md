# Arbitrage vault

## Getting started

To get a local copy up and running follow these simple steps

### Clone git repository

`git clone https://github.com/Hoocki/crypto-app`

### Setup backend
1. Inside project directory 
`cd backend`
2. Install modules
`npm install`
3. Run compile command
`npx hardhat compile`
4. Run test command
`npx hardhat test`
5. Setup hardhat node
`npx hardhat node`
6. Choose any account address from terminal, that will be **owner address**
7. Open another terminal and go to 'backend' package
`cd backend`
8. Deploy contracts to test net
`npx hardhat run scripts/deploy.js --network sepolia`
9. Remember  **Token address** from terminal

### Prepare for client setup 
You need to put Vault.json file from ..\crypto-app\backend\artifacts\contracts\Vault.sol\Vault.json to ..\crypto-app\frontend\src
Specify Vault contract (**Token address**) and its **owner addresses** in ..\crypto-app\frontend\src\settings.json

### Setup client
Inside project directory
`cd frontend
npm install
npm start`

### Enjoy!
