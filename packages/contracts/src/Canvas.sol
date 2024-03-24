// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IZoraCreator1155 } from "@zoralabs/zora-1155-contracts/interfaces/IZoraCreator1155.sol";

error Forbidden();
error InvalidCreateReferral();

contract Canvas {
  struct Asset {
    uint256 tokenId;
    address contractAddress;
    uint256 chainId;
  }

  struct Shape {
    uint256 id;
    uint256 x;
    uint256 y;
    uint256 rotation;
    address creator;
    uint256 createdAt;
    uint256 assetId;
  }

  mapping(address => mapping(uint256 => Shape)) public canvases;
  mapping(uint256 => Asset) public assets;

  function editCanvas(address canvasOwner, Shape[] memory shapes, Asset[] memory assets_) external {
    for (uint256 i = 0; i < shapes.length; i++) {
      Shape memory shape = canvases[canvasOwner][shapes[i].id];
      if (msg.sender != canvasOwner && msg.sender != shape.creator) {
        revert Forbidden();
      }

      canvases[canvasOwner][shapes[i].id] = shapes[i];
    }

    // Adding new assets
    for (uint i = 0; i < assets_.length; i++) {
      uint256 assetId = getAssetId(assets_[i].tokenId, assets_[i].contractAddress, assets_[i].chainId);

      if (assets[assetId].contractAddress != address(0)) {
        continue;
      }
      assets[assetId] = assets_[i];
    }
  }

  function createSticker(
    address contractAddress,
    string calldata newURI,
    uint256 maxSupply,
    address createReferral
  ) external {
    if (createReferral == address(0)) {
      revert InvalidCreateReferral();
    }
    IZoraCreator1155 token = IZoraCreator1155(contractAddress);
    uint256 tokenId = token.setupNewTokenWithCreateReferral(newURI, maxSupply, createReferral);

    uint256 chainId;
    assembly {
      chainId := chainid()
    }

    uint256 assetId = getAssetId(tokenId, contractAddress, chainId);

    assets[assetId] = Asset(tokenId, contractAddress, chainId);
  }

  function getAssetId(uint256 tokenId, address contractAddress, uint256 chainId) public pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(tokenId, contractAddress, chainId)));
  }
}
