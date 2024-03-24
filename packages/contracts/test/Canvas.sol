// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { Canvas } from "../src/Canvas.sol";

contract CounterTest is Test {
  Canvas public canvas;

  function setUp() public {
    canvas = new Canvas();
  }
}
