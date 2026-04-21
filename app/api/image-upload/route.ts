
import { NextRequest,NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import {auth} from "@clerk/nextjs/server"

// Configuration
 cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

  interface CloudinaryUploadResult{
    public_id:string;
    [key:string]:any
  }

  export async function POST(request:NextRequest) {
    const {userId} = await auth();
    if(!userId){
      return NextResponse.json({error:"unauthorized"},{status:401})
    }

    try {
     const formData = await request.formData();
     const file = formData.get("file") as File | null; 
     if(!file){
      return NextResponse.json({error:"File not found"},{status:400})
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes)

    const result=await new Promise<CloudinaryUploadResult>(
      (resolve,reject)=>{
        const upload_stream=cloudinary.uploader.upload_stream(
          {folder:"cloudinary_clerk_saas"},
          (error,result)=>{
            if(error) reject(error);
            else resolve(result as CloudinaryUploadResult)
          }
        )
        upload_stream.end(buffer)

      }
    )
    return NextResponse.json({publicId:result.public_id},{status:200})
    } catch (error) {
      console.log("Upload image failed",error);
      return NextResponse.json({message:"Upload image failed"},{status:500})
    }

  }
