// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { IZoraCreator1155 } from "@zoralabs/zora-1155-contracts/interfaces/IZoraCreator1155.sol";
import { Script, console } from "forge-std/Script.sol";
import { Canvas } from "../src/Canvas.sol";
import { Upgrades } from "@openzeppelin/foundry-upgrades/src/Upgrades.sol";

contract CanvasDeployScript is Script {
  function setUp() public {}

  function run() public {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address tokenAddress = vm.envAddress("TOKEN_ADDRESS");

    vm.startBroadcast(deployerPrivateKey);

    address owner = vm.addr(deployerPrivateKey);
    address proxy = Upgrades.deployUUPSProxy("Canvas.sol", abi.encodeCall(Canvas.initialize, (owner)));
    console.log("proxy", proxy);

    IZoraCreator1155 token = IZoraCreator1155(tokenAddress);
    token.addPermission(0, proxy, token.PERMISSION_BIT_ADMIN());

    vm.stopBroadcast();
  }
}
