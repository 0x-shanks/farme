import { siteOrigin } from '../../app/constants';
export const getImageCircles = async (files: File[]): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  canvas.width = 1000;
  canvas.height = 1000;

  if (ctx == null) {
    throw new Error('ctx is not found');
  }

  ctx.fillStyle = 'rgb(33,65,251)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await renderLogo(ctx);

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  const radii = [canvasWidth / 4, canvasWidth / 6, canvasWidth / 8];
  const radics = [0, canvasWidth / 6, canvasWidth / 3, canvasWidth / 2];

  await Promise.all(
    files.slice(0, 22).map(async (file, i) => {
      let num = 0;
      let radius = 0;
      let radic = 0;
      if (i < 1) {
        num = 1;
        radius = radii[0];
        radic = radics[0];
      } else if (i < 7) {
        num = 6;
        radius = radii[1];
        radic = radics[1];
      } else if (i < 22) {
        num = 15;
        radius = radii[2];
        radic = radics[2];
      }
      const angle = ((i % num) * 2 * Math.PI) / num;

      let margin = 80;
      if (i == 0) {
        margin = 0;
      }

      let x = centerX + (radic + margin) * Math.cos(angle);
      let y = centerY + (radic + margin) * Math.sin(angle);

      await renderImageCircle(
        file,
        ctx as CanvasRenderingContext2D,
        x - radius / 2,
        y - radius / 2,
        radius
      );
    })
  );

  75;

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b))
  );
  if (blob == null) {
    throw new Error('cannot make blob');
  }
  return blob;
};

export const renderImageCircle = async (
  file: File,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const newCanvas = document.createElement('canvas'); // 新しいcanvas要素
    const newCtx = newCanvas.getContext('2d');

    newCanvas.width = size;
    newCanvas.height = size;

    if (newCtx == null) {
      throw new Error('ctx is not found');
    }

    img.onload = () => {
      newCtx.drawImage(img, 0, 0, size, size);
      newCtx.globalCompositeOperation = 'destination-in';
      newCtx.beginPath();
      newCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
      newCtx.closePath();
      newCtx.fill();
      newCtx.restore();

      ctx.drawImage(newCanvas, x, y, size, size);

      resolve();
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = URL.createObjectURL(file);
  });
};

export const renderLogo = async (
  ctx: CanvasRenderingContext2D
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 800, 900, 165, 70);
      resolve();
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = `${siteOrigin}/images/logo-white.png`;
  });
};
