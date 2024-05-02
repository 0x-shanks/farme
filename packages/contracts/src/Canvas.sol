// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IZoraCreator1155 } from "@zoralabs/zora-1155-contracts/interfaces/IZoraCreator1155.sol";
import { ZoraCreatorFixedPriceSaleStrategy } from "@zoralabs/zora-1155-contracts/minters/fixed-price/ZoraCreatorFixedPriceSaleStrategy.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import { console } from "forge-std/Test.sol";

error Forbidden();
error InvalidCanvasOwner();
error InvalidCreateReferral();

contract Canvas is UUPSUpgradeable, OwnableUpgradeable {
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
    string mimeType;
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
  mapping(address => string) public canvasPreviewURI;

  event CreateSticker(address creator, uint256 id);
  event EditCanvas(address editor, address canvasOwner);

  modifier requiredCanvasOwner(address canvasOwner) {
    if (canvasOwner == address(0)) {
      revert InvalidCanvasOwner();
    }
    _;
  }

  function initialize(address owner) public initializer {
    __Ownable_init(owner);
  }

  function getShapeMap(address canvasOwner, uint256 shapeID) public view returns (Shape memory) {
    return shapeMap[canvasOwner][shapeID];
  }

  function getShapeIDs(address canvasOwner) public view returns (uint256[] memory) {
    return shapeIDs[canvasOwner];
  }

  function getAsset(uint256 assetID) public view returns (Asset memory) {
    return assets[assetID];
  }

  function getCanvasPreviewURI(address canvasOwner) public view returns (string memory) {
    return canvasPreviewURI[canvasOwner];
  }

  function getCanvas(
    address canvasOwner
  ) external view requiredCanvasOwner(canvasOwner) returns (Shape[] memory, Asset[] memory, string memory) {
    uint256 length = shapeIDs[canvasOwner].length;
    Shape[] memory shapes = new Shape[](length);
    Asset[] memory assets_ = new Asset[](length);
    for (uint256 i = 0; i < length; i++) {
      shapes[i] = shapeMap[canvasOwner][shapeIDs[canvasOwner][i]];
      assets_[i] = assets[shapes[i].assetID];
    }
    string memory previewURI = canvasPreviewURI[canvasOwner];

    return (shapes, assets_, previewURI);
  }

  function editCanvasFee(
    address feeTaker,
    address canvasOwner,
    Shape[] memory addedShapes,
    Shape[] memory updatedShapes,
    uint256[] memory deletedShapeIDs,
    Asset[] memory assets_,
    string memory previewURI
  ) external payable requiredCanvasOwner(canvasOwner) {
    uint256 value = msg.value;
    editCanvas(canvasOwner, addedShapes, updatedShapes, deletedShapeIDs, assets_, previewURI);
    payable(feeTaker).transfer(value);
  }

  function editCanvas(
    address canvasOwner,
    Shape[] memory addedShapes,
    Shape[] memory updatedShapes,
    uint256[] memory deletedShapeIDs,
    Asset[] memory assets_,
    string memory previewURI
  ) public requiredCanvasOwner(canvasOwner) {
    // Adding new assets
    // NOTE: No need to delete assets because it may be used by other users.
    for (uint i = 0; i < assets_.length; i++) {
      uint256 assetId = getAssetId(assets_[i].tokenID, assets_[i].contractAddress, assets_[i].chainID);

      if (assets[assetId].contractAddress != address(0)) {
        continue;
      }
      assets[assetId] = assets_[i];
    }

    uint256 lengthCounter = 0;
    uint256[] memory shapeIds_ = new uint256[](shapeIDs[canvasOwner].length + addedShapes.length);

    for (uint256 i = 0; i < shapeIDs[canvasOwner].length; i++) {
      bool isDeleteTarget = _getIsContain(deletedShapeIDs, shapeIDs[canvasOwner][i]);
      Shape memory shape = shapeMap[canvasOwner][shapeIDs[canvasOwner][i]];
      bool isCanvasOwner = _msgSender() == canvasOwner;
      bool isCreator = _msgSender() == shape.creator;
      bool hasAuth = isCanvasOwner || isCreator;

      // Delete shapes
      if (isDeleteTarget && hasAuth) {
        continue;
      }

      shapeIds_[lengthCounter] = shapeIDs[canvasOwner][i];
      lengthCounter++;
    }

    // Add shapes
    for (uint256 i = 0; i < addedShapes.length; i++) {
      shapeMap[canvasOwner][addedShapes[i].id] = addedShapes[i];
      shapeIds_[lengthCounter] = addedShapes[i].id;
      lengthCounter++;
    }

    // Update shapes
    for (uint256 i = 0; i < updatedShapes.length; i++) {
      Shape memory shape = shapeMap[canvasOwner][updatedShapes[i].id];
      Asset memory asset = assets[shape.assetID];
      bool isCanvasOwner = _msgSender() == canvasOwner;
      bool isCreator = _msgSender() == shape.creator;
      uint256 assetID = getAssetId(asset.tokenID, asset.contractAddress, asset.chainID);

      // If you do not have the authority to make changes
      if (!isCanvasOwner && !isCreator) {
        if (_getIsChange(shape, updatedShapes[i], asset, assets[assetID])) {
          continue;
        }
      }

      shapeMap[canvasOwner][updatedShapes[i].id] = updatedShapes[i];
    }

    uint256[] memory slimedShapeIds = new uint256[](lengthCounter);
    for (uint256 i = 0; i < lengthCounter; i++) {
      slimedShapeIds[i] = shapeIds_[i];
    }

    shapeIDs[canvasOwner] = slimedShapeIds;

    // Set preview
    canvasPreviewURI[canvasOwner] = previewURI;

    emit EditCanvas(_msgSender(), canvasOwner);
  }

  function _getIsContain(uint256[] memory ids, uint256 target) internal pure returns (bool) {
    for (uint256 i = 0; i < ids.length; i++) {
      if (ids[i] == target) {
        return true;
      }
    }
    return false;
  }

  function _hashFloat(Float memory num) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(num.value, num.decimal));
  }

  function _getIsChange(
    Shape memory bs,
    Shape memory as_,
    Asset memory ba,
    Asset memory aa
  ) internal pure returns (bool) {
    bytes32 beforeS = keccak256(
      abi.encodePacked(
        bs.id,
        _hashFloat(bs.x),
        _hashFloat(bs.y),
        _hashFloat(bs.rotation),
        bs.creator,
        bs.createdAt,
        bs.fid,
        bs.assetID,
        _hashFloat(bs.w),
        _hashFloat(bs.h),
        bs.index
      )
    );

    bytes32 afterS = keccak256(
      abi.encodePacked(
        as_.id,
        _hashFloat(as_.x),
        _hashFloat(as_.y),
        _hashFloat(as_.rotation),
        as_.creator,
        as_.createdAt,
        as_.fid,
        as_.assetID,
        _hashFloat(as_.w),
        _hashFloat(as_.h),
        as_.index
      )
    );

    if (beforeS != afterS) {
      return true;
    }

    bytes32 beforeA = keccak256(
      abi.encodePacked(
        ba.tokenID,
        ba.contractAddress,
        ba.chainID,
        ba.srcURI,
        ba.srcName,
        ba.mimeType,
        _hashFloat(ba.w),
        _hashFloat(ba.h)
      )
    );

    bytes32 afterA = keccak256(
      abi.encodePacked(
        aa.tokenID,
        aa.contractAddress,
        aa.chainID,
        aa.srcURI,
        aa.srcName,
        aa.mimeType,
        _hashFloat(aa.w),
        _hashFloat(aa.h)
      )
    );

    return beforeA != afterA;
  }

  function createSticker(
    address canvasOwner,
    string calldata newURI,
    Asset calldata asset,
    Shape calldata shape,
    uint256 maxSupply,
    address fixedPriceMinterAddress,
    ZoraCreatorFixedPriceSaleStrategy.SalesConfig memory salesConfig,
    address createReferral,
    string memory previewURI
  ) external requiredCanvasOwner(canvasOwner) {
    if (createReferral == address(0)) {
      revert InvalidCreateReferral();
    }

    IZoraCreator1155 token = IZoraCreator1155(asset.contractAddress);
    uint256 tokenID = token.setupNewTokenWithCreateReferral(newURI, maxSupply, createReferral);

    token.addPermission(0, fixedPriceMinterAddress, token.PERMISSION_BIT_MINTER());
    token.addPermission(tokenID, _msgSender(), token.PERMISSION_BIT_ADMIN());
    token.callSale(
      tokenID,
      ZoraCreatorFixedPriceSaleStrategy(fixedPriceMinterAddress),
      abi.encodeWithSelector(ZoraCreatorFixedPriceSaleStrategy.setSale.selector, tokenID, salesConfig)
    );

    token.adminMint(_msgSender(), tokenID, 1, "0x");

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
      mimeType: asset.mimeType,
      w: asset.w,
      h: asset.h
    });

    shapeIDs[canvasOwner].push(shape.id);
    shapeMap[canvasOwner][shape.id] = Shape({
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

    canvasPreviewURI[canvasOwner] = previewURI;

    emit CreateSticker(_msgSender(), tokenID);
  }

  function getAssetId(uint256 tokenId, address contractAddress, uint256 chainId) public pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(tokenId, contractAddress, chainId)));
  }

  function _authorizeUpgrade(address newImplementation) internal virtual override onlyOwner {}
}
