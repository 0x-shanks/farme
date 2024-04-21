export const getImageWithFrame = async (
  file: File,
  color: string
): Promise<{
  src: string;
  w: number;
  h: number;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };

      canvas.width = size.width;
      canvas.height = size.height;

      const isHorizontal = size.width > size.height;

      let cw = 0;
      let ch = 0;
      let space = 0;
      if (isHorizontal) {
        ch = size.height;
        cw = (ch / 4) * 3;
        space = cw / 20;
      } else {
        cw = size.width;
        ch = (cw * 4) / 3;
        space = ch / 20;
      }

      if (ctx == null) {
        throw new Error('ctx not found');
      }

      ctx.fillRect(
        (isHorizontal ? canvas.width / 4 : 0) + space,
        space,
        cw - space * 2,
        cw - space * 2
      );

      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(
        img,
        space,
        0,
        img.width - space * 2,
        img.height - space * 2
      );

      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = color;
      ctx.fillRect(isHorizontal ? canvas.width / 4 : 0, 0, cw, ch);

      const dataURL = canvas.toDataURL('image/png');
      resolve({
        src: dataURL,
        w: cw,
        h: ch
      });
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = URL.createObjectURL(file);
  });
};
