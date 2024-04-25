// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IZoraCreator1155 } from "@zoralabs/zora-1155-contracts/interfaces/IZoraCreator1155.sol";
import { IMinter1155 } from "@zoralabs/zora-1155-contracts/interfaces/IMinter1155.sol";
import { ICreatorRoyaltiesControl } from "@zoralabs/zora-1155-contracts/interfaces/ICreatorRoyaltiesControl.sol";

contract ZoraCreator1155Mock is IZoraCreator1155 {
  event SetupNewTokenWithCreateReferral(string newURI, uint256 maxSupply, address createReferral);
  event AddPermission(uint256 tokenId, address user, uint256 permissionBits);
  event CallSale(uint256 tokenId, IMinter1155 salesConfig, bytes data);

  function setupNewTokenWithCreateReferral(
    string calldata newURI,
    uint256 maxSupply,
    address createReferral
  ) external returns (uint256) {
    emit SetupNewTokenWithCreateReferral(newURI, maxSupply, createReferral);
    return 0;
  }

  function addPermission(uint256 tokenId, address user, uint256 permissionBits) external {
    emit AddPermission(tokenId, user, permissionBits);
  }

  function callSale(uint256 tokenId, IMinter1155 salesConfig, bytes memory data) external {
    emit CallSale(tokenId, salesConfig, data);
  }

  function contractVersion() external override returns (string memory) {}

  function owner() external view override returns (address) {}

  function supportsInterface(bytes4 interfaceId) external view override returns (bool) {}

  function balanceOf(address account, uint256 id) external view override returns (uint256) {}

  function balanceOfBatch(
    address[] calldata accounts,
    uint256[] calldata ids
  ) external view override returns (uint256[] memory) {}

  function setApprovalForAll(address operator, bool approved) external override {}

  function isApprovedForAll(address account, address operator) external view override returns (bool) {}

  function safeTransferFrom(
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes calldata data
  ) external override {}

  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] calldata ids,
    uint256[] calldata amounts,
    bytes calldata data
  ) external override {}

  function uri(uint256 id) external view override returns (string memory) {}

  function supportedPremintSignatureVersions() external pure override returns (string[] memory) {}

  function delegateSetupNewToken(
    bytes memory premintConfigEncoded,
    bytes32 premintVersion,
    bytes calldata signature,
    address sender,
    address premintSignerContract
  ) external override returns (uint256 newTokenId) {}

  function mint(
    IMinter1155 minter,
    uint256 tokenId,
    uint256 quantity,
    address[] memory rewardsRecipients,
    bytes calldata minterArguments
  ) external payable override {}

  function PERMISSION_BIT_ADMIN() external override returns (uint256) {}

  function PERMISSION_BIT_MINTER() external override returns (uint256) {}

  function PERMISSION_BIT_SALES() external override returns (uint256) {}

  function PERMISSION_BIT_METADATA() external override returns (uint256) {}

  function PERMISSION_BIT_FUNDS_MANAGER() external override returns (uint256) {}

  function setOwner(address newOwner) external override {}

  function mintWithRewards(
    IMinter1155 minter,
    uint256 tokenId,
    uint256 quantity,
    bytes calldata minterArguments,
    address mintReferral
  ) external payable override {}

  function adminMint(address recipient, uint256 tokenId, uint256 quantity, bytes memory data) external override {}

  function adminMintBatch(
    address recipient,
    uint256[] memory tokenIds,
    uint256[] memory quantities,
    bytes memory data
  ) external override {}

  function burnBatch(address user, uint256[] calldata tokenIds, uint256[] calldata amounts) external override {}

  function setupNewToken(string memory tokenURI, uint256 maxSupply) external override returns (uint256 tokenId) {}

  function getCreatorRewardRecipient(uint256 tokenId) external view override returns (address) {}

  function updateTokenURI(uint256 tokenId, string memory _newURI) external override {}

  function updateContractMetadata(string memory _newURI, string memory _newName) external override {}

  function contractURI() external view override returns (string memory) {}

  function assumeLastTokenIdMatches(uint256 tokenId) external override {}

  function updateRoyaltiesForToken(
    uint256 tokenId,
    ICreatorRoyaltiesControl.RoyaltyConfiguration memory royaltyConfiguration
  ) external override {}

  function setFundsRecipient(address payable fundsRecipient) external override {}

  function updateCreateReferral(uint256 tokenId, address recipient) external override {}

  function removePermission(uint256 tokenId, address user, uint256 permissionBits) external override {}

  function isAdminOrRole(address user, uint256 tokenId, uint256 role) external view override returns (bool) {}

  function getTokenInfo(uint256 tokenId) external view override returns (TokenData memory) {}

  function callRenderer(uint256 tokenId, bytes memory data) external override {}

  function mintFee() external view override returns (uint256) {}

  function withdraw() external override {}

  function implementation() external view override returns (address) {}
}
