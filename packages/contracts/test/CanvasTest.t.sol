// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { IZoraCreator1155 } from "@zoralabs/zora-1155-contracts/interfaces/IZoraCreator1155.sol";
import { ZoraCreatorFixedPriceSaleStrategy } from "@zoralabs/zora-1155-contracts/minters/fixed-price/ZoraCreatorFixedPriceSaleStrategy.sol";

import { Canvas } from "../src/Canvas.sol";
import { ZoraCreator1155Mock } from "./mock/ZoraCreator1155Mock.sol";

contract CanvasTest is Test {
  Canvas public canvas;
  ZoraCreator1155Mock public tokenContract;
  address alice = address(32);
  address bob = address(64);
  address carol = address(96);
  uint256 chainID = 31337;

  function setUp() public {
    canvas = new Canvas();
    tokenContract = new ZoraCreator1155Mock();
  }

  function _getAssetId(uint256 tokenId, address contractAddress, uint256 chainId) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(tokenId, contractAddress, chainId)));
  }

  function _getShapeHash(Canvas.Shape memory s) internal pure returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(
          s.id,
          s.x.value,
          s.x.decimal,
          s.y.value,
          s.y.decimal,
          s.rotation.value,
          s.rotation.decimal,
          s.creator,
          s.createdAt,
          s.fid,
          s.assetID,
          s.w.value,
          s.w.decimal,
          s.h.value,
          s.h.decimal,
          s.index
        )
      );
  }

  function _getAssetHash(Canvas.Asset memory a) internal pure returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(
          a.tokenID,
          a.contractAddress,
          a.chainID,
          a.srcURI,
          a.srcName,
          a.mimeType,
          a.w.value,
          a.w.decimal,
          a.h.value,
          a.h.decimal
        )
      );
  }

  function _copyShapes(Canvas.Shape[] memory original) internal pure returns (Canvas.Shape[] memory) {
    Canvas.Shape[] memory newArray = new Canvas.Shape[](original.length);
    for (uint256 i = 0; i < original.length; i++) {
      newArray[i] = original[i];
    }
    return newArray;
  }

  //
  // Positive
  //

  function testEditCanvas() public {
    //
    // Step 1: Bob create a new sticker for alice canvas
    //
    console.log("Step 1: Bob create a new sticker for alice canvas");

    Canvas.Shape[] memory shapes = new Canvas.Shape[](1);
    Canvas.Asset[] memory assets = new Canvas.Asset[](1);

    uint256 assetID = _getAssetId(1, address(tokenContract), chainID);

    Canvas.Shape memory shape1 = Canvas.Shape({
      id: 1,
      x: Canvas.Float({ decimal: 1, value: 1 }),
      y: Canvas.Float({ decimal: 1, value: 1 }),
      rotation: Canvas.Float({ decimal: 1, value: 1 }),
      creator: bob,
      createdAt: 1712296095,
      fid: 64,
      assetID: assetID,
      w: Canvas.Float({ decimal: 1, value: 1 }),
      h: Canvas.Float({ decimal: 1, value: 1 }),
      index: "index1"
    });

    shapes[0] = shape1;

    Canvas.Asset memory asset1 = Canvas.Asset({
      tokenID: 1,
      contractAddress: address(tokenContract),
      chainID: chainID,
      srcURI: "https://ipfs/asset1",
      srcName: "asset1",
      mimeType: "image/jpeg",
      w: Canvas.Float({ decimal: 0, value: 400 }),
      h: Canvas.Float({ decimal: 0, value: 400 })
    });

    assets[0] = asset1;

    vm.expectEmit(true, true, false, true);
    emit Canvas.EditCanvas(bob, alice);
    vm.prank(bob);
    canvas.editCanvas(alice, shapes, new Canvas.Shape[](0), new uint256[](0), assets, "https://ipfs/preview1");

    bytes32 got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[0]));
    bytes32 want = _getShapeHash(shape1);
    assertEq(got, want);

    got = _getAssetHash(canvas.getAsset(assetID));
    want = _getAssetHash(asset1);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), "https://ipfs/preview1");

    //
    // Step 2: Carol add stickers for alice canvas
    //
    console.log("Step 2: Carol add stickers for alice canvas");

    shapes = new Canvas.Shape[](2);
    assets = new Canvas.Asset[](1);

    // Carol's sticker
    assetID = _getAssetId(2, address(tokenContract), chainID);

    Canvas.Shape memory shape2 = Canvas.Shape({
      id: 2,
      x: Canvas.Float({ decimal: 1, value: 1 }),
      y: Canvas.Float({ decimal: 1, value: 1 }),
      rotation: Canvas.Float({ decimal: 1, value: 1 }),
      creator: carol,
      createdAt: 1712296095,
      fid: 96,
      assetID: assetID,
      w: Canvas.Float({ decimal: 1, value: 1 }),
      h: Canvas.Float({ decimal: 1, value: 1 }),
      index: "index2"
    });

    shapes[0] = shape2;

    Canvas.Shape memory shape3 = Canvas.Shape({
      id: 3,
      x: Canvas.Float({ decimal: 1, value: 1 }),
      y: Canvas.Float({ decimal: 1, value: 1 }),
      rotation: Canvas.Float({ decimal: 1, value: 1 }),
      creator: carol,
      createdAt: 1712296095,
      fid: 96,
      assetID: assetID,
      w: Canvas.Float({ decimal: 1, value: 1 }),
      h: Canvas.Float({ decimal: 1, value: 1 }),
      index: "index3"
    });

    shapes[1] = shape3;

    Canvas.Asset memory asset2 = Canvas.Asset({
      tokenID: 2,
      contractAddress: address(tokenContract),
      chainID: chainID,
      srcURI: "https://ipfs/asset2",
      srcName: "asset2",
      mimeType: "image/jpeg",
      w: Canvas.Float({ decimal: 0, value: 400 }),
      h: Canvas.Float({ decimal: 0, value: 400 })
    });

    assets[0] = asset2;

    vm.prank(carol);
    canvas.editCanvas(alice, shapes, new Canvas.Shape[](0), new uint256[](0), assets, "https://ipfs/preview2");

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[0]));
    want = _getShapeHash(shape1);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[1]));
    want = _getShapeHash(shape2);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[2]));
    want = _getShapeHash(shape3);
    assertEq(got, want);

    assetID = _getAssetId(2, address(tokenContract), chainID);
    got = _getAssetHash(canvas.getAsset(assetID));
    want = _getAssetHash(asset2);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), "https://ipfs/preview2");

    //
    // Step 3: Alice add stickers for her canvas
    //
    console.log("Step 3: Alice add stickers for her canvas");

    shapes = new Canvas.Shape[](2);
    assets = new Canvas.Asset[](1);

    // Carol's sticker
    assetID = _getAssetId(2, address(tokenContract), chainID);

    Canvas.Shape memory shape4 = Canvas.Shape({
      id: 4,
      x: Canvas.Float({ decimal: 1, value: 1 }),
      y: Canvas.Float({ decimal: 1, value: 1 }),
      rotation: Canvas.Float({ decimal: 1, value: 1 }),
      creator: alice,
      createdAt: 1712296095,
      fid: 96,
      assetID: assetID,
      w: Canvas.Float({ decimal: 1, value: 1 }),
      h: Canvas.Float({ decimal: 1, value: 1 }),
      index: "index4"
    });

    shapes[0] = shape4;

    Canvas.Shape memory shape5 = Canvas.Shape({
      id: 5,
      x: Canvas.Float({ decimal: 1, value: 1 }),
      y: Canvas.Float({ decimal: 1, value: 1 }),
      rotation: Canvas.Float({ decimal: 1, value: 1 }),
      creator: alice,
      createdAt: 1712296095,
      fid: 96,
      assetID: assetID,
      w: Canvas.Float({ decimal: 1, value: 1 }),
      h: Canvas.Float({ decimal: 1, value: 1 }),
      index: "index5"
    });

    shapes[1] = shape5;

    Canvas.Asset memory asset3 = Canvas.Asset({
      tokenID: 3,
      contractAddress: address(tokenContract),
      chainID: chainID,
      srcURI: "https://ipfs/asset3",
      srcName: "asset3",
      mimeType: "image/jpeg",
      w: Canvas.Float({ decimal: 0, value: 400 }),
      h: Canvas.Float({ decimal: 0, value: 400 })
    });

    assets[0] = asset3;

    vm.prank(alice);
    canvas.editCanvas(alice, shapes, new Canvas.Shape[](0), new uint256[](0), assets, "https://ipfs/preview3");

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[0]));
    want = _getShapeHash(shape1);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[1]));
    want = _getShapeHash(shape2);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[2]));
    want = _getShapeHash(shape3);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[3]));
    want = _getShapeHash(shape4);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[4]));
    want = _getShapeHash(shape5);
    assertEq(got, want);

    assetID = _getAssetId(2, address(tokenContract), chainID);
    got = _getAssetHash(canvas.getAsset(assetID));
    want = _getAssetHash(asset2);
    assertEq(got, want);

    assetID = _getAssetId(3, address(tokenContract), chainID);
    got = _getAssetHash(canvas.getAsset(assetID));
    want = _getAssetHash(asset3);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), "https://ipfs/preview3");

    //
    // Step 4: Bob rewrite his sticker in alice canvas
    //
    console.log("Step 4: Bob rewrite his sticker in alice canvas");

    shapes = new Canvas.Shape[](1);
    assetID = _getAssetId(1, address(tokenContract), chainID);

    shape1 = Canvas.Shape({
      id: 1,
      x: Canvas.Float({ decimal: 2, value: 2 }),
      y: Canvas.Float({ decimal: 2, value: 2 }),
      rotation: Canvas.Float({ decimal: 2, value: 2 }),
      creator: bob,
      createdAt: 1712296095,
      fid: 64,
      assetID: assetID,
      w: Canvas.Float({ decimal: 2, value: 2 }),
      h: Canvas.Float({ decimal: 2, value: 2 }),
      index: "index1"
    });
    shapes[0] = shape1;

    vm.prank(bob);
    canvas.editCanvas(alice, new Canvas.Shape[](0), shapes, new uint256[](0), assets, "https://ipfs/preview4");

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[0]));
    want = _getShapeHash(shape1);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[1]));
    want = _getShapeHash(shape2);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[2]));
    want = _getShapeHash(shape3);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[3]));
    want = _getShapeHash(shape4);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[4]));
    want = _getShapeHash(shape5);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), "https://ipfs/preview4");

    //
    // Step 5: Bob rewrite carol's sticker in alice canvas (Unchanged)
    //
    console.log("Step 5: Bob rewrite carol's sticker in alice canvas (Unchanged)");

    shapes = new Canvas.Shape[](1);
    shapes[0] = Canvas.Shape({
      id: 3,
      x: Canvas.Float({ decimal: 2, value: 2 }),
      y: Canvas.Float({ decimal: 2, value: 2 }),
      rotation: Canvas.Float({ decimal: 2, value: 2 }),
      creator: carol,
      createdAt: 1712296095,
      fid: 96,
      assetID: assetID,
      w: Canvas.Float({ decimal: 2, value: 2 }),
      h: Canvas.Float({ decimal: 2, value: 2 }),
      index: "index3"
    });

    vm.prank(bob);
    canvas.editCanvas(alice, new Canvas.Shape[](0), shapes, new uint256[](0), assets, "https://ipfs/preview5");

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[0]));
    want = _getShapeHash(shape1);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[1]));
    want = _getShapeHash(shape2);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[2]));
    want = _getShapeHash(shape3);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[3]));
    want = _getShapeHash(shape4);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[4]));
    want = _getShapeHash(shape5);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), "https://ipfs/preview5");

    //
    // Step 6: Alice updates in her canvas
    //
    console.log("Step 6: Alice updates in her canvas");

    assetID = _getAssetId(1, address(tokenContract), chainID);

    shape1 = Canvas.Shape({
      id: 1,
      x: Canvas.Float({ decimal: 3, value: 3 }),
      y: Canvas.Float({ decimal: 3, value: 3 }),
      rotation: Canvas.Float({ decimal: 3, value: 3 }),
      creator: bob,
      createdAt: 1712296095,
      fid: 64,
      assetID: assetID,
      w: Canvas.Float({ decimal: 3, value: 3 }),
      h: Canvas.Float({ decimal: 3, value: 3 }),
      index: "index1"
    });
    shapes[0] = shape1;

    vm.prank(alice);
    canvas.editCanvas(alice, new Canvas.Shape[](0), shapes, new uint256[](0), assets, "https://ipfs/preview6");

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[0]));
    want = _getShapeHash(shape1);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[1]));
    want = _getShapeHash(shape2);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[2]));
    want = _getShapeHash(shape3);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[3]));
    want = _getShapeHash(shape4);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[4]));
    want = _getShapeHash(shape5);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), "https://ipfs/preview6");

    //
    // Step 7: Carol delete a sticker from alice canvas
    //
    console.log("Step 7: Carol delete a sticker from alice canvas");

    uint256[] memory shapeIDs = new uint256[](1);
    // delete shape 3
    shapeIDs[0] = 3;

    vm.prank(carol);
    canvas.editCanvas(alice, new Canvas.Shape[](0), new Canvas.Shape[](0), shapeIDs, assets, "https://ipfs/preview7");

    assertEq(canvas.getShapeIDs(alice).length, 4);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[0]));
    want = _getShapeHash(shape1);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[1]));
    want = _getShapeHash(shape2);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[2]));
    want = _getShapeHash(shape4);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[3]));
    want = _getShapeHash(shape5);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), "https://ipfs/preview7");

    //
    // Step 8: Bob delete a carol's sticker in alice canvas (Unchanged)
    //
    console.log("Step 8: Bob delete a carol's sticker in alice canvas (Unchanged)");

    shapeIDs = new uint256[](1);
    // delete shape 2
    shapeIDs[0] = 2;

    vm.prank(bob);
    canvas.editCanvas(alice, new Canvas.Shape[](0), new Canvas.Shape[](0), shapeIDs, assets, "https://ipfs/preview8");

    assertEq(canvas.getShapeIDs(alice).length, 4);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[0]));
    want = _getShapeHash(shape1);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[1]));
    want = _getShapeHash(shape2);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[2]));
    want = _getShapeHash(shape4);
    assertEq(got, want);

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[3]));
    want = _getShapeHash(shape5);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), "https://ipfs/preview8");

    //
    // Step 9: Alice delete all stickers in her canvas
    //
    console.log("Step 9: Alice delete all stickers in her canvas");

    shapeIDs = new uint256[](4);
    shapeIDs[0] = 1;
    shapeIDs[1] = 2;
    shapeIDs[2] = 4;
    shapeIDs[3] = 5;

    vm.prank(alice);
    canvas.editCanvas(alice, new Canvas.Shape[](0), new Canvas.Shape[](0), shapeIDs, assets, "https://ipfs/preview9");

    assertEq(canvas.getShapeIDs(alice).length, 0);

    assertEq(canvas.getCanvasPreviewURI(alice), "https://ipfs/preview9");
  }

  function testCreateSticker() public {
    //
    // Step 1: Alice drop a new sticker in her canvas
    //
    console.log("Step 1: Alice drop a new sticker in her canvas");

    string memory newURI = "https://ipfs/asset-medatada";

    uint256 assetID = _getAssetId(1, address(tokenContract), chainID);

    Canvas.Shape memory shape = Canvas.Shape({
      id: 1,
      x: Canvas.Float({ decimal: 1, value: 1 }),
      y: Canvas.Float({ decimal: 1, value: 1 }),
      rotation: Canvas.Float({ decimal: 1, value: 1 }),
      creator: alice,
      createdAt: 1712296095,
      fid: 64,
      assetID: assetID,
      w: Canvas.Float({ decimal: 1, value: 1 }),
      h: Canvas.Float({ decimal: 1, value: 1 }),
      index: "index1"
    });

    Canvas.Asset memory asset = Canvas.Asset({
      tokenID: 1,
      contractAddress: address(tokenContract),
      chainID: chainID,
      srcURI: "https://ipfs/asset1",
      srcName: "asset1",
      mimeType: "image/jpeg",
      w: Canvas.Float({ decimal: 0, value: 400 }),
      h: Canvas.Float({ decimal: 0, value: 400 })
    });

    uint256 maxSupply = 10000;

    address fundsRecipient = address(200);
    ZoraCreatorFixedPriceSaleStrategy.SalesConfig memory salesConfig = ZoraCreatorFixedPriceSaleStrategy.SalesConfig({
      saleStart: 100,
      saleEnd: 200,
      maxTokensPerAddress: 10,
      pricePerToken: 20,
      fundsRecipient: fundsRecipient
    });

    address fixedPriceSaleStrategyAddress = address(300);
    ZoraCreatorFixedPriceSaleStrategy fixedPriceSaleStrategy = ZoraCreatorFixedPriceSaleStrategy(
      fixedPriceSaleStrategyAddress
    );

    address createReferral = address(400);

    string memory previewURI = "https://ipfs/preview";

    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.SetupNewTokenWithCreateReferral(newURI, maxSupply, createReferral);

    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.AddPermission(0, fixedPriceSaleStrategyAddress, tokenContract.PERMISSION_BIT_MINTER());
    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.AddPermission(1, alice, tokenContract.PERMISSION_BIT_ADMIN());

    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.CallSale(
      1,
      fixedPriceSaleStrategy,
      abi.encodeWithSelector(ZoraCreatorFixedPriceSaleStrategy.setSale.selector, 1, salesConfig)
    );
    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.AdminMint(alice, 1, 1, "0x");
    vm.expectEmit(true, true, false, false);
    emit Canvas.CreateSticker(alice, 1);
    vm.prank(alice);
    canvas.createSticker(
      alice,
      newURI,
      asset,
      shape,
      maxSupply,
      fixedPriceSaleStrategyAddress,
      salesConfig,
      createReferral,
      previewURI
    );

    bytes32 got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[0]));
    bytes32 want = _getShapeHash(shape);
    assertEq(got, want);

    got = _getAssetHash(canvas.getAsset(assetID));
    want = _getAssetHash(asset);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), previewURI);

    //
    // Step 2: Bob drop a new sticker in alice's canvas
    //
    console.log("Step 2: Bob drop a new sticker in alice's canvas");

    tokenContract.setTokenId(2);

    assetID = _getAssetId(2, address(tokenContract), chainID);

    shape = Canvas.Shape({
      id: 2,
      x: Canvas.Float({ decimal: 1, value: 1 }),
      y: Canvas.Float({ decimal: 1, value: 1 }),
      rotation: Canvas.Float({ decimal: 1, value: 1 }),
      creator: bob,
      createdAt: 1712296095,
      fid: 64,
      assetID: assetID,
      w: Canvas.Float({ decimal: 1, value: 1 }),
      h: Canvas.Float({ decimal: 1, value: 1 }),
      index: "index2"
    });

    asset = Canvas.Asset({
      tokenID: 2,
      contractAddress: address(tokenContract),
      chainID: chainID,
      srcURI: "https://ipfs/asset1",
      srcName: "asset2",
      mimeType: "image/jpeg",
      w: Canvas.Float({ decimal: 0, value: 400 }),
      h: Canvas.Float({ decimal: 0, value: 400 })
    });

    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.SetupNewTokenWithCreateReferral(newURI, maxSupply, createReferral);

    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.AddPermission(0, fixedPriceSaleStrategyAddress, tokenContract.PERMISSION_BIT_MINTER());
    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.AddPermission(1, alice, tokenContract.PERMISSION_BIT_ADMIN());

    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.CallSale(
      1,
      fixedPriceSaleStrategy,
      abi.encodeWithSelector(ZoraCreatorFixedPriceSaleStrategy.setSale.selector, 2, salesConfig)
    );
    vm.expectEmit(true, true, true, false);
    emit ZoraCreator1155Mock.AdminMint(bob, 2, 1, "0x");
    vm.expectEmit(true, true, false, false);
    emit Canvas.CreateSticker(alice, 2);
    vm.prank(bob);
    canvas.createSticker(
      alice,
      newURI,
      asset,
      shape,
      maxSupply,
      fixedPriceSaleStrategyAddress,
      salesConfig,
      createReferral,
      previewURI
    );

    got = _getShapeHash(canvas.getShapeMap(alice, canvas.getShapeIDs(alice)[1]));
    want = _getShapeHash(shape);
    assertEq(got, want);

    got = _getAssetHash(canvas.getAsset(assetID));
    want = _getAssetHash(asset);
    assertEq(got, want);

    assertEq(canvas.getCanvasPreviewURI(alice), previewURI);
  }
}
