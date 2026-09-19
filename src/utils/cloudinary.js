import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localFilePath, resource_type = "auto") => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resource_type,
    });

    // just checking what does cloudinary sends in response
    // console.log(response);

    fs.unlinkSync(localFilePath);

    // console.log(`Uploaded file to cloudinary with url ${response.url}`);
    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath);
  }
};

const deleteFromCloudinary = async (pubilcId) => {
  try {
    if (!pubilcId) return null;
    const response = await cloudinary.uploader.destroy(pubilcId);

    // just checking what does cloudinary sends in response
    console.log(response);

    return response;
  } catch (error) {
    console.log(error);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
