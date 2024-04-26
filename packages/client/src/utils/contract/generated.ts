//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Canvas
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const canvasAbi = [
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'assets',
    outputs: [
      { name: 'tokenID', internalType: 'uint256', type: 'uint256' },
      { name: 'contractAddress', internalType: 'address', type: 'address' },
      { name: 'chainID', internalType: 'uint256', type: 'uint256' },
      { name: 'srcURI', internalType: 'string', type: 'string' },
      { name: 'srcName', internalType: 'string', type: 'string' },
      { name: 'mimeType', internalType: 'string', type: 'string' },
      {
        name: 'w',
        internalType: 'struct Canvas.Float',
        type: 'tuple',
        components: [
          { name: 'decimal', internalType: 'uint16', type: 'uint16' },
          { name: 'value', internalType: 'int256', type: 'int256' },
        ],
      },
      {
        name: 'h',
        internalType: 'struct Canvas.Float',
        type: 'tuple',
        components: [
          { name: 'decimal', internalType: 'uint16', type: 'uint16' },
          { name: 'value', internalType: 'int256', type: 'int256' },
        ],
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'canvasPreviewURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'canvasOwner', internalType: 'address', type: 'address' },
      { name: 'newURI', internalType: 'string', type: 'string' },
      {
        name: 'asset',
        internalType: 'struct Canvas.Asset',
        type: 'tuple',
        components: [
          { name: 'tokenID', internalType: 'uint256', type: 'uint256' },
          { name: 'contractAddress', internalType: 'address', type: 'address' },
          { name: 'chainID', internalType: 'uint256', type: 'uint256' },
          { name: 'srcURI', internalType: 'string', type: 'string' },
          { name: 'srcName', internalType: 'string', type: 'string' },
          { name: 'mimeType', internalType: 'string', type: 'string' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
        ],
      },
      {
        name: 'shape',
        internalType: 'struct Canvas.Shape',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          {
            name: 'x',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'y',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'rotation',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'fid', internalType: 'uint256', type: 'uint256' },
          { name: 'assetID', internalType: 'uint256', type: 'uint256' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'index', internalType: 'string', type: 'string' },
        ],
      },
      { name: 'maxSupply', internalType: 'uint256', type: 'uint256' },
      {
        name: 'fixedPriceMinterAddress',
        internalType: 'address',
        type: 'address',
      },
      {
        name: 'salesConfig',
        internalType: 'struct ZoraCreatorFixedPriceSaleStrategy.SalesConfig',
        type: 'tuple',
        components: [
          { name: 'saleStart', internalType: 'uint64', type: 'uint64' },
          { name: 'saleEnd', internalType: 'uint64', type: 'uint64' },
          {
            name: 'maxTokensPerAddress',
            internalType: 'uint64',
            type: 'uint64',
          },
          { name: 'pricePerToken', internalType: 'uint96', type: 'uint96' },
          { name: 'fundsRecipient', internalType: 'address', type: 'address' },
        ],
      },
      { name: 'createReferral', internalType: 'address', type: 'address' },
      { name: 'previewURI', internalType: 'string', type: 'string' },
    ],
    name: 'createSticker',
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [
      { name: 'canvasOwner', internalType: 'address', type: 'address' },
      {
        name: 'addedShapes',
        internalType: 'struct Canvas.Shape[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          {
            name: 'x',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'y',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'rotation',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'fid', internalType: 'uint256', type: 'uint256' },
          { name: 'assetID', internalType: 'uint256', type: 'uint256' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'index', internalType: 'string', type: 'string' },
        ],
      },
      {
        name: 'updatedShapes',
        internalType: 'struct Canvas.Shape[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          {
            name: 'x',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'y',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'rotation',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'fid', internalType: 'uint256', type: 'uint256' },
          { name: 'assetID', internalType: 'uint256', type: 'uint256' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'index', internalType: 'string', type: 'string' },
        ],
      },
      { name: 'deletedShapeIDs', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'assets_',
        internalType: 'struct Canvas.Asset[]',
        type: 'tuple[]',
        components: [
          { name: 'tokenID', internalType: 'uint256', type: 'uint256' },
          { name: 'contractAddress', internalType: 'address', type: 'address' },
          { name: 'chainID', internalType: 'uint256', type: 'uint256' },
          { name: 'srcURI', internalType: 'string', type: 'string' },
          { name: 'srcName', internalType: 'string', type: 'string' },
          { name: 'mimeType', internalType: 'string', type: 'string' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
        ],
      },
      { name: 'previewURI', internalType: 'string', type: 'string' },
    ],
    name: 'editCanvas',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'feeTaker', internalType: 'address', type: 'address' },
      { name: 'canvasOwner', internalType: 'address', type: 'address' },
      {
        name: 'addedShapes',
        internalType: 'struct Canvas.Shape[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          {
            name: 'x',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'y',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'rotation',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'fid', internalType: 'uint256', type: 'uint256' },
          { name: 'assetID', internalType: 'uint256', type: 'uint256' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'index', internalType: 'string', type: 'string' },
        ],
      },
      {
        name: 'updatedShapes',
        internalType: 'struct Canvas.Shape[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          {
            name: 'x',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'y',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'rotation',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'fid', internalType: 'uint256', type: 'uint256' },
          { name: 'assetID', internalType: 'uint256', type: 'uint256' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'index', internalType: 'string', type: 'string' },
        ],
      },
      { name: 'deletedShapeIDs', internalType: 'uint256[]', type: 'uint256[]' },
      {
        name: 'assets_',
        internalType: 'struct Canvas.Asset[]',
        type: 'tuple[]',
        components: [
          { name: 'tokenID', internalType: 'uint256', type: 'uint256' },
          { name: 'contractAddress', internalType: 'address', type: 'address' },
          { name: 'chainID', internalType: 'uint256', type: 'uint256' },
          { name: 'srcURI', internalType: 'string', type: 'string' },
          { name: 'srcName', internalType: 'string', type: 'string' },
          { name: 'mimeType', internalType: 'string', type: 'string' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
        ],
      },
      { name: 'previewURI', internalType: 'string', type: 'string' },
    ],
    name: 'editCanvasFee',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'assetID', internalType: 'uint256', type: 'uint256' }],
    name: 'getAsset',
    outputs: [
      {
        name: '',
        internalType: 'struct Canvas.Asset',
        type: 'tuple',
        components: [
          { name: 'tokenID', internalType: 'uint256', type: 'uint256' },
          { name: 'contractAddress', internalType: 'address', type: 'address' },
          { name: 'chainID', internalType: 'uint256', type: 'uint256' },
          { name: 'srcURI', internalType: 'string', type: 'string' },
          { name: 'srcName', internalType: 'string', type: 'string' },
          { name: 'mimeType', internalType: 'string', type: 'string' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
        ],
      },
    ],
  },
  {
    stateMutability: 'pure',
    type: 'function',
    inputs: [
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
      { name: 'contractAddress', internalType: 'address', type: 'address' },
      { name: 'chainId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getAssetId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'canvasOwner', internalType: 'address', type: 'address' }],
    name: 'getCanvas',
    outputs: [
      {
        name: '',
        internalType: 'struct Canvas.Shape[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          {
            name: 'x',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'y',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'rotation',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'fid', internalType: 'uint256', type: 'uint256' },
          { name: 'assetID', internalType: 'uint256', type: 'uint256' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'index', internalType: 'string', type: 'string' },
        ],
      },
      {
        name: '',
        internalType: 'struct Canvas.Asset[]',
        type: 'tuple[]',
        components: [
          { name: 'tokenID', internalType: 'uint256', type: 'uint256' },
          { name: 'contractAddress', internalType: 'address', type: 'address' },
          { name: 'chainID', internalType: 'uint256', type: 'uint256' },
          { name: 'srcURI', internalType: 'string', type: 'string' },
          { name: 'srcName', internalType: 'string', type: 'string' },
          { name: 'mimeType', internalType: 'string', type: 'string' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
        ],
      },
      { name: '', internalType: 'string', type: 'string' },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'canvasOwner', internalType: 'address', type: 'address' }],
    name: 'getCanvasPreviewURI',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [{ name: 'canvasOwner', internalType: 'address', type: 'address' }],
    name: 'getShapeIDs',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: 'canvasOwner', internalType: 'address', type: 'address' },
      { name: 'shapeID', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getShapeMap',
    outputs: [
      {
        name: '',
        internalType: 'struct Canvas.Shape',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          {
            name: 'x',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'y',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'rotation',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
          { name: 'fid', internalType: 'uint256', type: 'uint256' },
          { name: 'assetID', internalType: 'uint256', type: 'uint256' },
          {
            name: 'w',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          {
            name: 'h',
            internalType: 'struct Canvas.Float',
            type: 'tuple',
            components: [
              { name: 'decimal', internalType: 'uint16', type: 'uint16' },
              { name: 'value', internalType: 'int256', type: 'int256' },
            ],
          },
          { name: 'index', internalType: 'string', type: 'string' },
        ],
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'initialize',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'shapeIDs',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
  },
  {
    stateMutability: 'view',
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'shapeMap',
    outputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      {
        name: 'x',
        internalType: 'struct Canvas.Float',
        type: 'tuple',
        components: [
          { name: 'decimal', internalType: 'uint16', type: 'uint16' },
          { name: 'value', internalType: 'int256', type: 'int256' },
        ],
      },
      {
        name: 'y',
        internalType: 'struct Canvas.Float',
        type: 'tuple',
        components: [
          { name: 'decimal', internalType: 'uint16', type: 'uint16' },
          { name: 'value', internalType: 'int256', type: 'int256' },
        ],
      },
      {
        name: 'rotation',
        internalType: 'struct Canvas.Float',
        type: 'tuple',
        components: [
          { name: 'decimal', internalType: 'uint16', type: 'uint16' },
          { name: 'value', internalType: 'int256', type: 'int256' },
        ],
      },
      { name: 'creator', internalType: 'address', type: 'address' },
      { name: 'createdAt', internalType: 'uint256', type: 'uint256' },
      { name: 'fid', internalType: 'uint256', type: 'uint256' },
      { name: 'assetID', internalType: 'uint256', type: 'uint256' },
      {
        name: 'w',
        internalType: 'struct Canvas.Float',
        type: 'tuple',
        components: [
          { name: 'decimal', internalType: 'uint16', type: 'uint16' },
          { name: 'value', internalType: 'int256', type: 'int256' },
        ],
      },
      {
        name: 'h',
        internalType: 'struct Canvas.Float',
        type: 'tuple',
        components: [
          { name: 'decimal', internalType: 'uint16', type: 'uint16' },
          { name: 'value', internalType: 'int256', type: 'int256' },
        ],
      },
      { name: 'index', internalType: 'string', type: 'string' },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
  },
  {
    stateMutability: 'payable',
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'CreateSticker',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'editor',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'canvasOwner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'EditCanvas',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'InvalidCanvasOwner' },
  { type: 'error', inputs: [], name: 'InvalidCreateReferral' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
] as const
