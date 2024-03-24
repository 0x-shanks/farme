// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Script, console } from "forge-std/Script.sol";
import { Canvas } from "../src/Canvas.sol";

contract CanvasDeployScript is Script {
  function setUp() public {}

  function run() public {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    new Canvas();

    vm.stopBroadcast();
  }
}