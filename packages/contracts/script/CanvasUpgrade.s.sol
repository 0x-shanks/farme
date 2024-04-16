// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { IZoraCreator1155 } from "@zoralabs/zora-1155-contracts/interfaces/IZoraCreator1155.sol";
import { Script, console } from "forge-std/Script.sol";
import { Canvas } from "../src/Canvas.sol";
import { Upgrades } from "@openzeppelin/foundry-upgrades/src/Upgrades.sol";
import { Options } from "@openzeppelin/foundry-upgrades/src/Options.sol";

contract CanvasUpgradeScript is Script {
  function setUp() public {}

  function run(address proxy) public {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);

    Options memory opts;
    opts.unsafeSkipAllChecks = true;
    Upgrades.upgradeProxy(proxy, "Canvas.sol", "", opts);

    vm.stopBroadcast();
  }
}
