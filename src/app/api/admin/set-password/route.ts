import { setAdminPassword } from "@/lib/actions/setAdminPassword";
import { NextResponse } from "next/server";

export async function GET() {
    await setAdminPassword("BMJE-pc-2@@1");
    return NextResponse.json({ success: true, message: "Admin password updated." });
}
