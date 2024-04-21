export const getImageWithEdge = async (
  file: File,
  color: string,
  samples: number = 36,
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

      for (let angle = 0; angle < 360; angle += 360 / samples) {
        ctx.drawImage(
          img,
          s * Math.sin((Math.PI * 2 * angle) / 360) + x,
          s * Math.cos((Math.PI * 2 * angle) / 360) + y,
        );
      }

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
