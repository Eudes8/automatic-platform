import { createAdminUser } from "@/lib/actions/initAdmin";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    // Check if user is authenticated and is admin
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (assuming role is in user metadata or from DB)
    // For simplicity, check email or something
    if (user.email !== "automaticbmje@gmail.com") {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await createAdminUser();
    return NextResponse.json({ success: true, message: "Admin initialization check complete." });
}
