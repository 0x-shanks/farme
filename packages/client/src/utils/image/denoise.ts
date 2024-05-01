export async function denoise(arrayBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  const imageData = await decodeImageData(arrayBuffer);

  let filteredImageData = applyFilterAlpha(imageData, 3, minFilter);
  filteredImageData = applyFilterAlpha(filteredImageData, 3, minFilter);
  filteredImageData = applyFilterAlpha(filteredImageData, 3, minFilter);
  filteredImageData = applyFilterAlpha(filteredImageData, 3, minFilter);
  filteredImageData = applyFilterAlpha(filteredImageData, 3, minFilter);
  filteredImageData = applyFilterAlpha(filteredImageData, 3, minFilter);
  return await encodeImageData(filteredImageData);
}

async function encodeImageData(imageData: ImageData): Promise<ArrayBuffer> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  ctx?.putImageData(imageData, 0, 0);
  const dataURL = canvas.toDataURL('image/png');
  const arrayBuffer = await fetch(dataURL).then((response) =>
    response.arrayBuffer()
  );
  return arrayBuffer;
}

async function decodeImageData(arrayBuffer: ArrayBuffer): Promise<ImageData> {
  const blob = new Blob([arrayBuffer]);
  const objectURL = URL.createObjectURL(blob);
  const image = new Image();
  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(image, 0, 0);
      const imageData = ctx?.getImageData(0, 0, image.width, image.height);
      resolve(imageData!);
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = objectURL;
  });
}
function applyFilterAlpha(
  imageData: ImageData,
  kernelSize: number,
  filter: (values: number[]) => number
): ImageData {
  const { width, height, data } = imageData;
  const filteredData = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const surroundingAlphaValues = [];
      for (
        let dx = -Math.floor(kernelSize / 2);
        dx <= Math.floor(kernelSize / 2);
        dx++
      ) {
        for (
          let dy = -Math.floor(kernelSize / 2);
          dy <= Math.floor(kernelSize / 2);
          dy++
        ) {
          const neighborX = x + dx;
          const neighborY = y + dy;

          if (
            neighborX >= 0 &&
            neighborX < imageData.width &&
            neighborY >= 0 &&
            neighborY < imageData.height
          ) {
            surroundingAlphaValues.push(
              getAlphaValue(imageData, neighborX, neighborY)
            );
          }
        }
      }
      const filteredAlphaValue = filter(surroundingAlphaValues);

      const offset = (y * width + x) * 4;
      filteredData[offset] = data[offset]; // R
      filteredData[offset + 1] = data[offset + 1]; // G
      filteredData[offset + 2] = data[offset + 2]; // B
      filteredData[offset + 3] = filteredAlphaValue;
    }
  }

  return new ImageData(filteredData, width, height);
}

function getAlphaValue(imageData: ImageData, x: number, y: number): number {
  const { width, data } = imageData;
  const offset = (y * width + x) * 4;

  return data[offset + 3];
}

function minFilter(values: number[]): number {
  return Math.min(...values);
}
