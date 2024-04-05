// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { Canvas } from "../src/Canvas.sol";

contract CanvasTest is Test {
  Canvas public canvas;

  function setUp() public {
    canvas = new Canvas();
  }

  function testEditCanvas() public {
    Canvas.Shape[] memory shapes = new Canvas.Shape[](1);
    address canvasOwner = address(1);
    address creator = address(2);
    address tokenContract = address(3);

    shapes[0] = Canvas.Shape({
      id: 67770199092617743910351793285416229309527010855021199064638607389970686012694,
      x: Canvas.Float({ decimal: 3, value: 1575 }),
      y: Canvas.Float({ decimal: 3, value: 4075 }),
      rotation: Canvas.Float({ decimal: 0, value: 0 }),
      creator: creator,
      createdAt: 1712296095,
      fid: 4735,
      assetID: 72053783946337331429407571750902264122717030526331493259686294470330364178541,
      w: Canvas.Float({ decimal: 0, value: 99 }),
      h: Canvas.Float({ decimal: 0, value: 81 }),
      index: "a1"
    });

    Canvas.Asset[] memory assets = new Canvas.Asset[](2);
    assets[0] = Canvas.Asset({
      tokenID: 21,
      contractAddress: tokenContract,
      chainID: 999999999,
      srcURI: "https://ipfs.decentralized-content.com/ipfs/QmRrRWQDCx4xGwgNGmeFAVajfmw9B1tXdyzmmBaqZYjQ8F",
      srcName: "t",
      mineType: "image/jpeg",
      w: Canvas.Float({ decimal: 0, value: 400 }),
      h: Canvas.Float({ decimal: 0, value: 400 })
    });
    assets[1] = Canvas.Asset({
      tokenID: 18,
      contractAddress: tokenContract,
      chainID: 999999999,
      srcURI: "https://ipfs.decentralized-content.com/ipfs/QmdHMz5FGiqgkkribBA7z8FjUQrz144AoVrv9xVuDci2Na",
      srcName: "Group 2 1.png",
      mineType: "image/png",
      w: Canvas.Float({ decimal: 0, value: 99 }),
      h: Canvas.Float({ decimal: 0, value: 81 })
    });

    canvas.editCanvas(
      canvasOwner,
      shapes,
      assets,
      "https://ipfs.decentralized-content.com/ipfs/QmTGrNrBKXUj4Y96avTPNS1KHddLMVN5dwQRLDEH2ZZfEp"
    );
  }
}
