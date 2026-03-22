import { useNavigate } from "react-router-dom";


export default function AuthOverlay() {
    const navigate = useNavigate();

    return (
        <div className="absolute inset-0 backdrop-blur-md bg-white/60 flex items-center  justify-center z-50">
            <div className="bg-white  rounded-2xl  shadow-xl p-6 text-center space-y-4 w-300px">

                <h2 className="text-lg font-semibold text-gray-900">
                    Login Required
                </h2>

                <p className="text-sm text-gray-500">
                    Please login to continue
                </p>


                <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl transition"
                >
                    Login
                </button>
            </div>

        </div>
    )
}