import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Ensure this key is correctly set in `.env.local`
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
      return NextResponse.json({ message: 'No file or fileName provided' }, { status: 400 });
    }

    // ✅ Convert file to Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // ✅ Ensure unique file name
    const uniqueFileName = `contract_${Date.now()}_${fileName}`;
    const filePath = `contracts/${uniqueFileName}`; // Store inside "contracts" folder

    // ✅ Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from("contracts") // 🔹 Use your actual Supabase bucket name
      .upload(filePath, fileBuffer, { upsert: false });

    if (error) throw error;

    // ✅ Generate public URL
    const { data: publicUrlData } = supabase.storage
      .from("contracts") // 🔹 Use the same bucket name
      .getPublicUrl(filePath);

    return NextResponse.json({
      message: "File uploaded successfully",
      url: publicUrlData.publicUrl, // ✅ Return public download URL
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ message: "Failed to upload file" }, { status: 500 });
  }
}
