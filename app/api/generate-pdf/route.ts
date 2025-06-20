// app/api/generate-pdf/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  try {
    const { html } = await request.json();

    // Launch Puppeteer in headless mode.
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set the HTML content of the page.
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate the PDF.
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="formatted_cv.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
