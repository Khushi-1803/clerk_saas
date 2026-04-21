

  import { NextRequest,NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import {auth} from "@clerk/nextjs/server"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()
// Configuration
  cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

  interface CloudinaryUploadResult{
    public_id:string;
    bytes:number;
    [key:string]:any;
    duration?:number
  }

  export async function POST(request:NextRequest) {
    

    try {
      const {userId} = await auth();
    if(!userId){
      return NextResponse.json({error:"unauthorized"},{status:401})
    }
    if(!process.env.CLOUDINARY_CLOUD_NAME|| !process.env.CLOUDINARY_API_KEY|| !process.env.CLOUDINARY_API_SECRET){
        return NextResponse.json({message:"Cloudinary credentials not found"},{status:500})
    }


     const formData = await request.formData();
     const file = formData.get("file") as File | null; 
     const title = formData.get("title") as string;
     const description = formData.get("description") as string;
     const originalSize = formData.get("originalSize") as string;
     if(!file){
      return NextResponse.json({error:"File not found"},{status:400})
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes)

    const result=await new Promise<CloudinaryUploadResult>(
      (resolve,reject)=>{
        const upload_stream=cloudinary.uploader.upload_stream(
          {
            resource_type:"video",
            folder:"video-upload",
            transformation:[
              {quality:"auto",fetch_format:"mp4"}
            ]
          },
          (error,result)=>{
            if(error) reject(error);
            else resolve(result as CloudinaryUploadResult)
          }
        )
        upload_stream.end(buffer)

      }
    )
    const video = await prisma.video.create({
      data:{
        title,
        description,
        publicId:result.public_id,
        originalSize:originalSize,
        compressedSize:String(result.bytes),
       duration:result.duration || 0

      }
    })
    return NextResponse.json(
      video
    )
    } catch (error) {
      console.log("Upload video failed",error);
      return NextResponse.json({message:"Upload video failed"},{status:500})
    }
    finally{
      await prisma.$disconnect()
    }

  }
