/**
 * Process an image file:
 * - Resize to max 800x800px while maintaining aspect ratio
 * - Compress to 85% quality
 * - Convert to Base64 data URL
 * - Ensure result is under 2MB
 */
export const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate new dimensions (max 800x800, maintain aspect ratio)
        let width = img.width;
        let height = img.height;
        const maxSize = 800;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        // Set canvas size and draw resized image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Base64 with 85% quality
        const base64 = canvas.toDataURL('image/jpeg', 0.85);

        // Check size (Base64 string length approximates byte size)
        const sizeInBytes = base64.length;
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

        if (sizeInBytes > maxSizeInBytes) {
          reject(new Error('Image size exceeds 2MB after compression. Please choose a smaller image.'));
          return;
        }

        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};
