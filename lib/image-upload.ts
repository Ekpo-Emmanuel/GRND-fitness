// Simple image upload utility
// In a production app, you'd want to use a cloud storage service like AWS S3, Cloudinary, etc.

export const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const validateImage = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 5MB' };
  }

  return { isValid: true };
};

export const uploadProfileImage = async (file: File): Promise<string> => {
  // Validate the image
  const validation = validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Compress the image
  const compressedImage = await compressImage(file);
  
  // In a real app, you would upload to cloud storage here
  // For now, we'll return the base64 data URL
  return compressedImage;
}; 