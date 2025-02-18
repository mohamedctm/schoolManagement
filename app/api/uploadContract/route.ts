import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
      return NextResponse.json({ message: 'No file or fileName provided' }, { status: 400 });
    }

    console.log("File size:", file.size);
    console.log("File type:", file.type);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uniqueFileName = `contract_${Date.now()}_${fileName}`;
    const filePath = `contracts/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from("contracts")
      .upload(filePath, fileBuffer, { upsert: false });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from("contracts")
      .getPublicUrl(filePath);

    return NextResponse.json({
      message: "File uploaded successfully",
      url: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ message: "Failed to upload file" }, { status: 500 });
  }
}