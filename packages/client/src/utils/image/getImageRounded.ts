export const getImageRounded = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };

      const cornerRadius = size.width / 5;

      canvas.width = size.width;
      canvas.height = size.height;

      if (ctx == null) {
        throw new Error('ctx not found');
      }

      // Set faux rounded corners
      ctx.lineJoin = 'round';
      ctx.lineWidth = cornerRadius;

      // Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
      ctx.strokeRect(
        0 + cornerRadius / 2,
        0 + cornerRadius / 2,
        canvas.width - cornerRadius,
        canvas.height - cornerRadius
      );
      ctx.fillRect(
        0 + cornerRadius / 2,
        0 + cornerRadius / 2,
        canvas.width - cornerRadius,
        canvas.height - cornerRadius
      );

      ctx.globalCompositeOperation = 'source-in';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = URL.createObjectURL(file);
  });
};
