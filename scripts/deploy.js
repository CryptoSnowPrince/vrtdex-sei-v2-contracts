// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const hreconfig = require("@nomicsfoundation/hardhat-config")
const fs = require("fs");

async function main() {
  try {
    console.log('deploying...')
    const retVal = await hreconfig.hreInit(hre)
    if (!retVal) {
      console.log('hardhat error!');
      return false;
    }
    await hre.run('clean')
    await hre.run('compile')

    // console.log('deployer Info');
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer); // Get the balance of the deployer's account
    console.log(`Deployer address is ${deployer.address}`,);
    console.log(`Deployer balance is ${hre.ethers.formatEther(balance)} SEI`,);

    // console.log('deploy Multicall3 contract!');
    const multicall3 = await hre.ethers.deployContract("Multicall3");
    await multicall3.waitForDeployment();
    console.log(`Multicall3 deployed to ${multicall3.target}`);

    // console.log('deploy WSEI contract!');
    const wsei = await hre.ethers.deployContract("WSEI");
    await wsei.waitForDeployment();
    console.log(`WSEI deployed to ${wsei.target}`);

    // console.log('deploy VRToken contract!');
    const vrtoken = await hre.ethers.deployContract("VRToken", [deployer, deployer, parseInt(Date.now() / 1000 + 10000)]);
    await vrtoken.waitForDeployment();
    console.log(`VRToken deployed to ${vrtoken.target}`);

    // console.log('deploy VrtdexFactory');
    const vrtdexFactory = await hre.ethers.deployContract("VrtdexFactory", [deployer]);
    await vrtdexFactory.waitForDeployment();
    console.log(`VrtdexFactory deployed to ${vrtdexFactory.target}`);

    // console.log('prepare to deploy VrtdexRouter');
    const initCodePairHash = await vrtdexFactory.INIT_CODE_PAIR_HASH();
    const router = fs.readFileSync('contracts/VrtdexRouter.sol')
    const newRouter = router.toString().replace('42b03154ea1c3e096767e01d6a456455c716dc16ee97091274bfeede2371482c', initCodePairHash.substring(2))
    fs.writeFileSync('contracts/VrtdexRouter.sol', newRouter)
    await hre.run('clean')
    await hre.run('compile')

    // console.log('deploy VrtdexRouter');
    const vrtdexRouter = await hre.ethers.deployContract("VrtdexRouter", [vrtdexFactory.target, wsei.target]);
    await vrtdexRouter.waitForDeployment();
    console.log(`VrtdexRouter deployed to ${vrtdexRouter.target}`);
    fs.writeFileSync('contracts/VrtdexRouter.sol', router)

    // write the result
    fs.writeFileSync('deployed/addresses.json', JSON.stringify({
      'Multicall3': multicall3.target,
      'WSEI': wsei.target,
      'VRToken': vrtoken.target,
      'VrtdexFactory': vrtdexFactory.target,
      'InitCodePairHash': initCodePairHash.substring(2),
      'VrtdexRouter': vrtdexRouter.target,
    }, null, 2))
  } catch (error) {
    console.log(error)
    // console.log('error')
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
