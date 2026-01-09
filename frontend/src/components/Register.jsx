import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Import Link

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/user/register/", { username, password });
            alert("Registration Successful! Please Login.");
            navigate("/login");
        } catch (error) {
            alert("Registration Failed: Username might be taken.");
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
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h2>
                        <p className="mt-2 text-sm text-gray-600">Start your journey with us today.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">Choose Username</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-green-600 focus:ring-green-600 sm:text-sm" placeholder="username" required />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-900">Choose Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-green-600 focus:ring-green-600 sm:text-sm" placeholder="••••••••" required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full rounded-lg bg-green-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50">
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="font-semibold text-green-600 hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
            {/* Right Side - Image Area */}
            <div className="hidden h-screen w-1/2 bg-gray-100 lg:block">
                <div className="relative h-full w-full">
                    <img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2500&auto=format&fit=crop" alt="Register Background" />
                    <div className="absolute inset-0 bg-green-900/20 backdrop-brightness-75"></div>
                    <div className="absolute bottom-0 left-0 p-12 text-white">
                        <h2 className="text-4xl font-bold">Join the community.</h2>
                        <p className="mt-4 text-lg text-gray-200">A secure place for your memories and ideas.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;