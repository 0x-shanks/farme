//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Canvas
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const canvasAbi = [
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "assets",
    outputs: [
      { name: "tokenID", internalType: "uint256", type: "uint256" },
      { name: "contractAddress", internalType: "address", type: "address" },
      { name: "chainID", internalType: "uint256", type: "uint256" },
      { name: "srcURI", internalType: "string", type: "string" },
      { name: "srcName", internalType: "string", type: "string" },
      { name: "mineType", internalType: "string", type: "string" },
      {
        name: "w",
        internalType: "struct Canvas.Float",
        type: "tuple",
        components: [
          { name: "decimal", internalType: "uint16", type: "uint16" },
          { name: "value", internalType: "int256", type: "int256" },
        ],
      },
      {
        name: "h",
        internalType: "struct Canvas.Float",
        type: "tuple",
        components: [
          { name: "decimal", internalType: "uint16", type: "uint16" },
          { name: "value", internalType: "int256", type: "int256" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "canvasPreviewURI",
    outputs: [{ name: "", internalType: "string", type: "string" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "canvasOwner", internalType: "address", type: "address" },
      { name: "newURI", internalType: "string", type: "string" },
      {
        name: "asset",
        internalType: "struct Canvas.Asset",
        type: "tuple",
        components: [
          { name: "tokenID", internalType: "uint256", type: "uint256" },
          { name: "contractAddress", internalType: "address", type: "address" },
          { name: "chainID", internalType: "uint256", type: "uint256" },
          { name: "srcURI", internalType: "string", type: "string" },
          { name: "srcName", internalType: "string", type: "string" },
          { name: "mineType", internalType: "string", type: "string" },
          {
            name: "w",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "h",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
        ],
      },
      {
        name: "shape",
        internalType: "struct Canvas.Shape",
        type: "tuple",
        components: [
          { name: "id", internalType: "uint256", type: "uint256" },
          {
            name: "x",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "y",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "rotation",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          { name: "creator", internalType: "address", type: "address" },
          { name: "createdAt", internalType: "uint256", type: "uint256" },
          { name: "fid", internalType: "uint256", type: "uint256" },
          { name: "assetID", internalType: "uint256", type: "uint256" },
          {
            name: "w",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "h",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          { name: "index", internalType: "string", type: "string" },
        ],
      },
      { name: "maxSupply", internalType: "uint256", type: "uint256" },
      {
        name: "fixedPriceMinterAddress",
        internalType: "address",
        type: "address",
      },
      {
        name: "salesConfig",
        internalType: "struct ZoraCreatorFixedPriceSaleStrategy.SalesConfig",
        type: "tuple",
        components: [
          { name: "saleStart", internalType: "uint64", type: "uint64" },
          { name: "saleEnd", internalType: "uint64", type: "uint64" },
          {
            name: "maxTokensPerAddress",
            internalType: "uint64",
            type: "uint64",
          },
          { name: "pricePerToken", internalType: "uint96", type: "uint96" },
          { name: "fundsRecipient", internalType: "address", type: "address" },
        ],
      },
      { name: "createReferral", internalType: "address", type: "address" },
      { name: "previewURI", internalType: "string", type: "string" },
    ],
    name: "createSticker",
    outputs: [],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [
      { name: "canvasOwner", internalType: "address", type: "address" },
      {
        name: "shapes",
        internalType: "struct Canvas.Shape[]",
        type: "tuple[]",
        components: [
          { name: "id", internalType: "uint256", type: "uint256" },
          {
            name: "x",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "y",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "rotation",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          { name: "creator", internalType: "address", type: "address" },
          { name: "createdAt", internalType: "uint256", type: "uint256" },
          { name: "fid", internalType: "uint256", type: "uint256" },
          { name: "assetID", internalType: "uint256", type: "uint256" },
          {
            name: "w",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "h",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          { name: "index", internalType: "string", type: "string" },
        ],
      },
      {
        name: "assets_",
        internalType: "struct Canvas.Asset[]",
        type: "tuple[]",
        components: [
          { name: "tokenID", internalType: "uint256", type: "uint256" },
          { name: "contractAddress", internalType: "address", type: "address" },
          { name: "chainID", internalType: "uint256", type: "uint256" },
          { name: "srcURI", internalType: "string", type: "string" },
          { name: "srcName", internalType: "string", type: "string" },
          { name: "mineType", internalType: "string", type: "string" },
          {
            name: "w",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "h",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
        ],
      },
      { name: "previewURI", internalType: "string", type: "string" },
    ],
    name: "editCanvas",
    outputs: [],
  },
  {
    stateMutability: "pure",
    type: "function",
    inputs: [
      { name: "tokenId", internalType: "uint256", type: "uint256" },
      { name: "contractAddress", internalType: "address", type: "address" },
      { name: "chainId", internalType: "uint256", type: "uint256" },
    ],
    name: "getAssetId",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [{ name: "canvasOwner", internalType: "address", type: "address" }],
    name: "getCanvas",
    outputs: [
      {
        name: "",
        internalType: "struct Canvas.Shape[]",
        type: "tuple[]",
        components: [
          { name: "id", internalType: "uint256", type: "uint256" },
          {
            name: "x",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "y",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "rotation",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          { name: "creator", internalType: "address", type: "address" },
          { name: "createdAt", internalType: "uint256", type: "uint256" },
          { name: "fid", internalType: "uint256", type: "uint256" },
          { name: "assetID", internalType: "uint256", type: "uint256" },
          {
            name: "w",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "h",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          { name: "index", internalType: "string", type: "string" },
        ],
      },
      {
        name: "",
        internalType: "struct Canvas.Asset[]",
        type: "tuple[]",
        components: [
          { name: "tokenID", internalType: "uint256", type: "uint256" },
          { name: "contractAddress", internalType: "address", type: "address" },
          { name: "chainID", internalType: "uint256", type: "uint256" },
          { name: "srcURI", internalType: "string", type: "string" },
          { name: "srcName", internalType: "string", type: "string" },
          { name: "mineType", internalType: "string", type: "string" },
          {
            name: "w",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
          {
            name: "h",
            internalType: "struct Canvas.Float",
            type: "tuple",
            components: [
              { name: "decimal", internalType: "uint16", type: "uint16" },
              { name: "value", internalType: "int256", type: "int256" },
            ],
          },
        ],
      },
      { name: "", internalType: "string", type: "string" },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "shapeIDs",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "shapeMap",
    outputs: [
      { name: "id", internalType: "uint256", type: "uint256" },
      {
        name: "x",
        internalType: "struct Canvas.Float",
        type: "tuple",
        components: [
          { name: "decimal", internalType: "uint16", type: "uint16" },
          { name: "value", internalType: "int256", type: "int256" },
        ],
      },
      {
        name: "y",
        internalType: "struct Canvas.Float",
        type: "tuple",
        components: [
          { name: "decimal", internalType: "uint16", type: "uint16" },
          { name: "value", internalType: "int256", type: "int256" },
        ],
      },
      {
        name: "rotation",
        internalType: "struct Canvas.Float",
        type: "tuple",
        components: [
          { name: "decimal", internalType: "uint16", type: "uint16" },
          { name: "value", internalType: "int256", type: "int256" },
        ],
      },
      { name: "creator", internalType: "address", type: "address" },
      { name: "createdAt", internalType: "uint256", type: "uint256" },
      { name: "fid", internalType: "uint256", type: "uint256" },
      { name: "assetID", internalType: "uint256", type: "uint256" },
      {
        name: "w",
        internalType: "struct Canvas.Float",
        type: "tuple",
        components: [
          { name: "decimal", internalType: "uint16", type: "uint16" },
          { name: "value", internalType: "int256", type: "int256" },
        ],
      },
      {
        name: "h",
        internalType: "struct Canvas.Float",
        type: "tuple",
        components: [
          { name: "decimal", internalType: "uint16", type: "uint16" },
          { name: "value", internalType: "int256", type: "int256" },
        ],
      },
      { name: "index", internalType: "string", type: "string" },
    ],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "creator",
        internalType: "address",
        type: "address",
        indexed: false,
      },
      { name: "id", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "CreateSticker",
  },
  { type: "error", inputs: [], name: "Forbidden" },
  { type: "error", inputs: [], name: "InvalidCanvasOwner" },
  { type: "error", inputs: [], name: "InvalidCreateReferral" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CounterTest
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const counterTestAbi = [
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "IS_TEST",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "canvas",
    outputs: [{ name: "", internalType: "contract Canvas", type: "address" }],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "excludeArtifacts",
    outputs: [
      {
        name: "excludedArtifacts_",
        internalType: "string[]",
        type: "string[]",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "excludeContracts",
    outputs: [
      {
        name: "excludedContracts_",
        internalType: "address[]",
        type: "address[]",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "excludeSenders",
    outputs: [
      {
        name: "excludedSenders_",
        internalType: "address[]",
        type: "address[]",
      },
    ],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "failed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
  },
  {
    stateMutability: "nonpayable",
    type: "function",
    inputs: [],
    name: "setUp",
    outputs: [],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "targetArtifactSelectors",
    outputs: [
      {
        name: "targetedArtifactSelectors_",
        internalType: "struct StdInvariant.FuzzSelector[]",
        type: "tuple[]",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "targetArtifacts",
    outputs: [
      {
        name: "targetedArtifacts_",
        internalType: "string[]",
        type: "string[]",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "targetContracts",
    outputs: [
      {
        name: "targetedContracts_",
        internalType: "address[]",
        type: "address[]",
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "targetSelectors",
    outputs: [
      {
        name: "targetedSelectors_",
        internalType: "struct StdInvariant.FuzzSelector[]",
        type: "tuple[]",
        components: [
          { name: "addr", internalType: "address", type: "address" },
          { name: "selectors", internalType: "bytes4[]", type: "bytes4[]" },
        ],
      },
    ],
  },
  {
    stateMutability: "view",
    type: "function",
    inputs: [],
    name: "targetSenders",
    outputs: [
      {
        name: "targetedSenders_",
        internalType: "address[]",
        type: "address[]",
      },
    ],
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "string", type: "string", indexed: false },
    ],
    name: "log",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "address", type: "address", indexed: false },
    ],
    name: "log_address",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "val",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
    ],
    name: "log_array",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "val",
        internalType: "int256[]",
        type: "int256[]",
        indexed: false,
      },
    ],
    name: "log_array",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "val",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
    ],
    name: "log_array",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "log_bytes",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "bytes32", type: "bytes32", indexed: false },
    ],
    name: "log_bytes32",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "int256", type: "int256", indexed: false },
    ],
    name: "log_int",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      { name: "val", internalType: "address", type: "address", indexed: false },
    ],
    name: "log_named_address",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      {
        name: "val",
        internalType: "uint256[]",
        type: "uint256[]",
        indexed: false,
      },
    ],
    name: "log_named_array",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      {
        name: "val",
        internalType: "int256[]",
        type: "int256[]",
        indexed: false,
      },
    ],
    name: "log_named_array",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      {
        name: "val",
        internalType: "address[]",
        type: "address[]",
        indexed: false,
      },
    ],
    name: "log_named_array",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      { name: "val", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "log_named_bytes",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      { name: "val", internalType: "bytes32", type: "bytes32", indexed: false },
    ],
    name: "log_named_bytes32",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      { name: "val", internalType: "int256", type: "int256", indexed: false },
      {
        name: "decimals",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "log_named_decimal_int",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      { name: "val", internalType: "uint256", type: "uint256", indexed: false },
      {
        name: "decimals",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "log_named_decimal_uint",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      { name: "val", internalType: "int256", type: "int256", indexed: false },
    ],
    name: "log_named_int",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      { name: "val", internalType: "string", type: "string", indexed: false },
    ],
    name: "log_named_string",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "key", internalType: "string", type: "string", indexed: false },
      { name: "val", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "log_named_uint",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "string", type: "string", indexed: false },
    ],
    name: "log_string",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "log_uint",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "", internalType: "bytes", type: "bytes", indexed: false },
    ],
    name: "logs",
  },
] as const;
