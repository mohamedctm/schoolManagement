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
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this key is correctly set in your `.env` file
);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const fileName = formData.get('fileName') as string;

  if (!file || !fileName) {
    return NextResponse.json({ message: 'No file or fileName provided' }, { status: 400 });
  }

  try {
    // Ensure unique filename to avoid conflicts
    const uniqueFileName = `contract_${Date.now()}_${fileName}`;
    const filePath = `contracts/${uniqueFileName}`; // Inside a "contracts" folder in Supabase

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(filePath, file, { upsert: false });

    if (error) throw error;

    // Generate public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('your-bucket-name')
      .getPublicUrl(filePath);

    return NextResponse.json({ message: 'File uploaded successfully', url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ message: 'Failed to upload file' }, { status: 500 });
  }
}
