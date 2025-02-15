// import { NextResponse } from 'next/server';
// import fs from 'fs';
// import path from 'path';

// export async function POST(request: Request) {
//   const formData = await request.formData();
//   const file = formData.get('file') as File;
//   const fileName = formData.get('fileName') as string;

//   if (!file || !fileName) {
//     return NextResponse.json({ message: 'No file or fileName provided' }, { status: 400 });
//   }

//   const fileBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(fileBuffer);

//   const filePath = path.join(process.cwd(), 'public', 'contracts', fileName);

//   try {
//     fs.writeFileSync(filePath, buffer);
//     return NextResponse.json({ message: 'File uploaded successfully', fileName });
//   } catch (error) {
//     console.error('Error writing file:', error);
//     return NextResponse.json({ message: 'Failed to upload file' }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const fileName = formData.get("fileName") as string;

  if (!file || !fileName) {
    return NextResponse.json({ message: "No file or fileName provided" }, { status: 400 });
  }

  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  try {
    const blob = await put(`contracts/${fileName}`, buffer, {
      access: "public",
    });

    return NextResponse.json({ message: "File uploaded successfully", url: blob.url });
  } catch (error) {
    console.error("Blob upload error:", error);
    return NextResponse.json({ message: "Failed to upload file" }, { status: 500 });
  }
}
