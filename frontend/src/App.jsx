function App() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-600">
            Document Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Upload and manage company documents
          </p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow">
          🔔 Notifications
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Total Documents</h2>
          <p className="text-3xl font-bold mt-2 text-blue-600">0</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Uploads Today</h2>
          <p className="text-3xl font-bold mt-2 text-green-500">0</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Notifications</h2>
          <p className="text-3xl font-bold mt-2 text-purple-500">0</p>
        </div>

      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl shadow p-10 border-2 border-dashed border-blue-300 text-center">

        <h2 className="text-2xl font-bold text-blue-600 mb-3">
          Upload PDF Documents
        </h2>

        <p className="text-gray-500 mb-5">
          Drag & drop files here or click below
        </p>

        <input
          type="file"
          multiple
          accept=".pdf"
          className="mb-5"
        />

        <br />

        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700">
          Upload Files
        </button>

      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl shadow p-10 mt-8 text-center">

        <h2 className="text-2xl font-bold text-gray-700">
          No Documents Uploaded
        </h2>

        <p className="text-gray-500 mt-3">
          Uploaded files will appear here
        </p>

      </div>

    </div>
  )
}

export default App