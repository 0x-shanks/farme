export const getImageWithEdge = async (
  file: File,
  s: number,
  color: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const x = 50;
    const y = 50;

    img.onload = () => {
      const size = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      canvas.width = size.width + 100;
      canvas.height = size.height + 100;

      if (ctx == null) {
        throw new Error("ctx not found");
      }

      for (let i = 0; i < 360; i++)
        ctx.drawImage(img, x + Math.sin(i) * s, y + Math.cos(i) * s);

      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = color;
      ctx.fillRect(50, 50, canvas.width, canvas.height);

      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, 50, 50, img.width, img.height);

      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };

    img.onerror = (error) => {
      reject(error);
    };

    img.src = URL.createObjectURL(file);
  });
};
