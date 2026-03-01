import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: "dnb2n8wup",
  api_key: "489968673151659",
  api_secret: "ZcaVyV3S296M8Fc1sXQVpn4tT9Q",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "fan-profiles",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 400, height: 400, crop: "limit" }],
  },
});

export { cloudinary, storage };