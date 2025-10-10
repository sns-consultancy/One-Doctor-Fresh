<div className="flex flex-col items-center mt-6">
  <div className="flex justify-center items-center gap-4 mb-4">
    <img src="/female-doctor.png" alt="Doctor Female" className="w-16 h-16 rounded-full" />
    <h1 className="text-3xl font-bold text-blue-600">
      Hello, {user?.displayName || username}!
    </h1>
    <img src="/male-doctor.png" alt="Doctor Male" className="w-16 h-16 rounded-full" />
  </div>
  <p className="text-gray-600 text-lg">
    Welcome back to your personalized health dashboard.
  </p>
</div>
