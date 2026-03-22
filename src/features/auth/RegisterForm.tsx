import { useForm } from "react-hook-form"
import { useAuthStore } from "../../store/authStore"
import { useNavigate } from "react-router-dom"

type FormData = {
  email: string
  password: string
}

export default function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const signUp = useAuthStore((s) => s.signUp)
  const navigate = useNavigate()

  async function onSubmit(data: FormData) {
    const err = await signUp(data.email, data.password)
    
    if (!err) navigate("/restaurants")
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-md space-y-5 animate-fade-in"
    >
      <h2 className="text-2xl font-semibold text-gray-900">Create account</h2>

    
      <div>
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none transition"
          {...register("email", {
            required: "Email required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Invalid email",
            },
          })}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

   
      <div>
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-400 outline-none transition"
          {...register("password", {
            required: "Password required",
            minLength: {
              value: 6,
              message: "Min 6 characters",
            },
          })}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold transition transform hover:scale-[1.02]">
        Sign Up
      </button>
    </form>
  )
}