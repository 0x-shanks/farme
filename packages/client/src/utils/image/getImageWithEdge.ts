export const getImageWithEdge = async (
  file: File,
  color: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      const x = size.width / 10;
      const y = x;
      const s = x / 2;

      canvas.width = size.width + x * 2;
      canvas.height = size.height + x * 2;

      if (ctx == null) {
        throw new Error("ctx not found");
      }

      for (let i = 0; i < 360; i++)
        ctx.drawImage(img, x + Math.sin(i) * s, y + Math.cos(i) * s);

      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, x, x, img.width, img.height);

      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = URL.createObjectURL(file);
  });
};
