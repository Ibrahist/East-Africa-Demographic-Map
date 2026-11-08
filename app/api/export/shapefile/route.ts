import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feature, name = "place" } = body;

    if (!feature) {
      return NextResponse.json({ error: "No GeoJSON feature provided" }, { status: 400 });
    }

    const cleanName = String(name).replace(/[^a-zA-Z0-9_-]/g, "_");
    const tempDir = os.tmpdir();
    const tempId = `shp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const inputJsonPath = path.join(tempDir, `${tempId}.json`);
    const outputZipPath = path.join(tempDir, `${cleanName}_shapefile.zip`);

    // Write input GeoJSON
    fs.writeFileSync(inputJsonPath, JSON.stringify(feature), "utf-8");

    // Execute Python export_shapefile
    const pyProcess = spawn("python", ["-m", "pipeline.export_shapefile", inputJsonPath, outputZipPath], {
      cwd: process.cwd(),
    });

    const exitCode = await new Promise<number>((resolve) => {
      pyProcess.on("close", resolve);
      pyProcess.on("error", (err) => {
        console.error("Python execution error:", err);
        resolve(1);
      });
    });

    if (exitCode !== 0 || !fs.existsSync(outputZipPath)) {
      if (fs.existsSync(inputJsonPath)) fs.unlinkSync(inputJsonPath);
      return NextResponse.json({ error: "Failed to generate Shapefile" }, { status: 500 });
    }

    const zipBuffer = fs.readFileSync(outputZipPath);

    // Cleanup temp files
    try {
      if (fs.existsSync(inputJsonPath)) fs.unlinkSync(inputJsonPath);
      if (fs.existsSync(outputZipPath)) fs.unlinkSync(outputZipPath);
    } catch (e) {
      // Ignore cleanup error
    }

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${cleanName}_shapefile.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (err: any) {
    console.error("Shapefile export error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

