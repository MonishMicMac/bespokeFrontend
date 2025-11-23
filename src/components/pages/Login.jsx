import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔐 If already logged in → don’t allow login page
  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (admin) {
      navigate("/");
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/admin/login", {
        name,
        password,
      });

      if (res.data.status === "success") {
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
        navigate("/");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 md:px-6 py-8">
      <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-xl overflow-hidden max-h-[90vh] grid grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="bg-gradient-to-b from-pink-400 to-pink-500 text-white p-10 md:p-12 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-center">
            <img
              src={`${IMAGE_URL}login_image.png`}
              alt="Bespoke Illustration"
              className="w-72 md:w-96 object-contain"
            />
          </div>

          <div className="max-w-md mt-8">
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Bespoke Fashion <br />
              Management
            </h1>
            <p className="text-base opacity-90 mt-4 leading-relaxed">
              Manage your fashion design business with powerful tools tailored
              for designers, creators, and modern brands.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 md:p-12 flex items-center justify-center overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleLogin} className="w-full max-w-sm space-y-8">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">
                B
              </div>
              <span className="text-xl font-semibold text-gray-900">Bespoke</span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-1">Please login to your account</p>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}

            {/* Fields */}
            <div className="space-y-5">
              <div>
                <label className="text-gray-700 font-medium text-sm">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-100 px-4 py-3 border border-gray-200 rounded-xl outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="text-gray-700 font-medium text-sm">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-100 px-4 py-3 border border-gray-200 rounded-xl outline-none text-gray-800"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-pink-500 text-white font-semibold rounded-xl text-lg"
              >
                Login
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500">Or Login with</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Social buttons */}
            <div className="flex gap-4">
              <button type="button" className="flex-1 py-3 rounded-xl border border-gray-300 bg-white font-medium">Google</button>
              <button type="button" className="flex-1 py-3 rounded-xl border border-gray-300 bg-white font-medium">Facebook</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
