import axios from 'axios';
 const uploadToCloudinary = async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'auto_trust'); // Your upload preset here
  
    try {
      const response = await axios.post('https://api.cloudinary.com/v1_1/dquspyuhw/upload', formData);
  
      // Axios automatically parses the response, so you can directly access `data`
      const { secure_url, public_id } = response.data;
  
      return {
        url: secure_url,
        publicId: public_id,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error uploading to Cloudinary:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error uploading to Cloudinary:', error);
      }
      throw new Error('An error occurred while uploading the file to Cloudinary.');
    }
  };

  export default uploadToCloudinary;