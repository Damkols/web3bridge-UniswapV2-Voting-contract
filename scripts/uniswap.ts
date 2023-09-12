import { ethers, network } from "hardhat";

async function main() {
 const uniswapAddr = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
 const uniswapFactoryAddr = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
 //Deadline
 const currentTimestampInSeconds = Math.round(Date.now() / 1000);
 const deadline = currentTimestampInSeconds + 86400;

 //To address
 const to = "0xd8500DA651A2e472AD870cDf76B5756F9c113257";

 //Getting the Uniswap contract
 const uniswap = await ethers.getContractAt("IUniswap", uniswapAddr);
 //Getting the Uniswap Factory contract
 const uniswapFactory = await ethers.getContractAt(
  "IUniswapV2Factory",
  uniswapFactoryAddr
 );

 //ERC20 Adresses and getting access to their interfaces
 const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
 const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
 const USDCContract = await ethers.getContractAt("IERC20", USDC);
 const DAIContract = await ethers.getContractAt("IERC20", DAI);

 //Impersonating UNi Whale and DAI Whale
 //Holder
 const UsdcDaiWhale = "0x20bB82F2Db6FF52b42c60cE79cDE4C7094Ce133F";
 const UsdcDaiSigner = await ethers.getImpersonatedSigner(UsdcDaiWhale);

 //Uniswap parameters
 const amountADesired = ethers.parseEther("2");
 const amountBDesired = ethers.parseEther("2");
 const amountRADesired = ethers.parseEther("0");
 const amountRBDesired = ethers.parseEther("0");
 const amountAMin = ethers.parseEther("0");
 const amountBMin = ethers.parseEther("0");
 const amountETHMin = ethers.parseEther("1");
 const AmountETHinMax = ethers.parseEther("10");

 await network.provider.send("hardhat_setBalance", [
  UsdcDaiWhale,
  "0x5FDBB2BFAEE375E47C64C00000",
 ]);

 //  Approve Token to add Liquidity
 const approvedAmt = ethers.parseEther("10");
 const approveUsdcToken = await USDCContract.connect(UsdcDaiSigner).approve(
  uniswapAddr,
  approvedAmt
 );
 const approveDaiToken = await DAIContract.connect(UsdcDaiSigner).approve(
  uniswapAddr,
  approvedAmt
 );

 const aprovalRecipt = await Promise.all([
  approveUsdcToken.wait(),
  approveDaiToken.wait(),
 ]);
 console.log(aprovalRecipt);

 const toAddr = await USDCContract.balanceOf(to);

 console.log(toAddr);

 console.log(
  `USDC Balance before ${ethers.formatUnits(
   await USDCContract.balanceOf(UsdcDaiWhale),
   6
  )})`
 );

 console.log(
  `Dai Balance before ${ethers.formatEther(
   await DAIContract.balanceOf(UsdcDaiWhale)
  )})`
 );

 const txaddLiqiudity = await uniswap
  .connect(UsdcDaiSigner)
  .addLiquidity(
   USDC,
   DAI,
   amountADesired,
   amountBDesired,
   amountAMin,
   amountBMin,
   UsdcDaiWhale,
   deadline
  );

 await txaddLiqiudity.wait();
 console.log("Transaction hash:", txaddLiqiudity.hash);

 //   uniswapFactory

 const getLiquidityPair = await uniswapFactory
  .connect(UsdcDaiSigner)
  .getPair(USDC, DAI);
 const pairContract = await ethers.getContractAt("IERC20", getLiquidityPair);

 const pairLiquidity = await pairContract.balanceOf(UsdcDaiSigner);

 console.log(getLiquidityPair);
 console.log(pairContract);
 console.log(pairLiquidity);

 const approvePairLiquidity = await pairContract
  .connect(UsdcDaiSigner)
  .approve(uniswapAddr, pairLiquidity);

 const aprovalRecipt1 = await Promise.all([approvePairLiquidity.wait()]);

 console.log(aprovalRecipt1);

 console.log(approvePairLiquidity);

 const txremoveLiqiudity = await uniswap
  .connect(UsdcDaiSigner)
  .removeLiquidity(
   USDC,
   DAI,
   pairLiquidity,
   amountRADesired,
   amountRBDesired,
   UsdcDaiWhale,
   deadline
  );

 await txremoveLiqiudity.wait();
 console.log(txremoveLiqiudity);
 console.log("Transaction hash:", txremoveLiqiudity.hash);

 console.log(
  `USDC Balance after ${ethers.formatUnits(
   await USDCContract.balanceOf(UsdcDaiWhale),
   6
  )})`
 );

 console.log(
  `Dai Balance after ${ethers.formatEther(
   await DAIContract.balanceOf(UsdcDaiWhale)
  )})`
 );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
 console.error(error);
 process.exitCode = 1;
});
