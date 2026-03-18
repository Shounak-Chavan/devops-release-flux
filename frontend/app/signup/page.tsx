import SignupForm from "../../features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <span className="font-bold text-white">FF</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">FeatureFlow</span>
      </div>
      <SignupForm />
    </div>
  );
}