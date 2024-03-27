// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IZoraCreator1155 } from "@zoralabs/zora-1155-contracts/interfaces/IZoraCreator1155.sol";
import { ZoraCreatorFixedPriceSaleStrategy } from "@zoralabs/zora-1155-contracts/minters/fixed-price/ZoraCreatorFixedPriceSaleStrategy.sol";

error Forbidden();
error InvalidCreateReferral();

contract Canvas {
  struct Float {
    uint16 decimal;
    int256 value;
  }

  struct Asset {
    uint256 tokenID;
    address contractAddress;
    uint256 chainID;
    string srcURI;
    string srcName;
    string mineType;
    Float w;
    Float h;
  }

  struct Shape {
    uint256 id;
    Float x;
    Float y;
    Float rotation;
    address creator;
    uint256 createdAt;
    uint256 fid;
    uint256 assetID;
    Float w;
    Float h;
    string index;
  }

  mapping(address => mapping(uint256 => Shape)) public shapeMap;
  mapping(address => uint256[]) public shapeIDs;
  mapping(uint256 => Asset) public assets;

  event CreateSticker(address creator, uint256 id);

  function getCanvas(address canvasOwner) external view returns (Shape[] memory, Asset[] memory) {
    uint256 length = shapeIDs[canvasOwner].length;
    Shape[] memory shapes = new Shape[](length);
    Asset[] memory assets_ = new Asset[](length);
    for (uint256 i = 0; i < length; i++) {
      shapes[i] = shapeMap[canvasOwner][shapeIDs[canvasOwner][i]];
      assets_[i] = assets[shapes[i].assetID];
    }

    return (shapes, assets_);
  }

  function editCanvas(address canvasOwner, Shape[] memory shapes, Asset[] memory assets_) external {
    uint256[] memory shapeIds_ = new uint256[](shapes.length);
    for (uint256 i = 0; i < shapes.length; i++) {
      Shape memory shape = shapeMap[canvasOwner][shapes[i].id];
      if (msg.sender != canvasOwner && msg.sender != shape.creator) {
        revert Forbidden();
      }

      shapeMap[canvasOwner][shapes[i].id] = shapes[i];
      shapeIds_[i] = shapes[i].id;
    }
    shapeIDs[canvasOwner] = shapeIds_;

    // Adding new assets
    for (uint i = 0; i < assets_.length; i++) {
      uint256 assetId = getAssetId(assets_[i].tokenID, assets_[i].contractAddress, assets_[i].chainID);

      if (assets[assetId].contractAddress != address(0)) {
        continue;
      }
      assets[assetId] = assets_[i];
    }
  }

  function createSticker(
    string calldata newURI,
    Asset calldata asset,
    Shape calldata shape,
    uint256 maxSupply,
    address fixedPriceMinterAddress,
    ZoraCreatorFixedPriceSaleStrategy.SalesConfig memory salesConfig
  ) external {
    IZoraCreator1155 token = IZoraCreator1155(asset.contractAddress);
    uint256 tokenID = token.setupNewTokenWithCreateReferral(newURI, maxSupply, msg.sender);

    token.addPermission(0, fixedPriceMinterAddress, token.PERMISSION_BIT_MINTER());
    token.callSale(
      tokenID,
      ZoraCreatorFixedPriceSaleStrategy(fixedPriceMinterAddress),
      abi.encodeWithSelector(ZoraCreatorFixedPriceSaleStrategy.setSale.selector, tokenID, salesConfig)
    );

    token.adminMint(msg.sender, tokenID, 1, "0x");

    uint256 chainID;
    assembly {
      chainID := chainid()
    }

    uint256 assetID = getAssetId(tokenID, asset.contractAddress, chainID);

    assets[assetID] = Asset({
      tokenID: tokenID,
      contractAddress: asset.contractAddress,
      chainID: chainID,
      srcURI: asset.srcURI,
      srcName: asset.srcName,
      mineType: asset.mineType,
      w: asset.w,
      h: asset.h
    });

    shapeIDs[msg.sender].push(shape.id);
    shapeMap[msg.sender][shape.id] = Shape({
      id: shape.id,
      x: shape.x,
      y: shape.y,
      rotation: shape.rotation,
      creator: shape.creator,
      createdAt: shape.createdAt,
      fid: shape.fid,
      assetID: assetID,
      w: shape.w,
      h: shape.h,
      index: shape.index
    });

    emit CreateSticker(msg.sender, tokenID);
  }

  function getAssetId(uint256 tokenId, address contractAddress, uint256 chainId) public pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(tokenId, contractAddress, chainId)));
  }
}
