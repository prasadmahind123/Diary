import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Import Link

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/token/", { username, password });
            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);
            navigate("/");
        } catch (error) {
            alert("Login Failed: Check your credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full" style={{ animation: "fadeIn 0.5s ease-out" }}>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            {/* Left Side - Form Area */}
            <div className="flex w-full flex-col justify-center bg-white px-8 sm:px-12 lg:w-1/2 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                        <p className="mt-2 text-sm text-gray-600">Please enter your details to access your diary.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">Username</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600 sm:text-sm" placeholder="Enter your username" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-600 focus:ring-blue-600 sm:text-sm" placeholder="••••••••" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50">
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account yet? <Link to="/register" className="font-semibold text-blue-600 hover:underline">Sign up here</Link>
                    </p>
                </div>
            </div>
            {/* Right Side - Image Area */}
            <div className="hidden h-screen w-1/2 bg-gray-100 lg:block">
                <div className="relative h-full w-full">
                    <img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2500&auto=format&fit=crop" alt="Diary Background" />
                    <div className="absolute inset-0 bg-blue-900/20 backdrop-brightness-75"></div>
                    <div className="absolute bottom-0 left-0 p-12 text-white">
                        <h2 className="text-4xl font-bold">Capture your thoughts.</h2>
                        <p className="mt-4 text-lg text-gray-200">Your personal space to reflect, write, and remember.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;