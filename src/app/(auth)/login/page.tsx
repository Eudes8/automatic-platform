import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background patterns - Subtle Light Mode */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-200/40 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full flex justify-center">
                <LoginForm />
            </div>
        </main>
    );
}
