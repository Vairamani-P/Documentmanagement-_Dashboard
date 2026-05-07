import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

function App() {

  const [files, setFiles] = useState([]);

  const [progress, setProgress] = useState([]);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {

  socket.on("new-notification", (data) => {

    toast.success(data.message);

    setNotifications((prev) => [data, ...prev]);

  });

}, []);

  const handleFiles = (e) => {

    const selectedFiles = Array.from(e.target.files);

    setFiles(selectedFiles);

  };

  const uploadFiles = async () => {

    if (files.length === 0) {
      toast.error("Please select files");
      return;
    }

    if (files.length > 3) {
      toast("Uploading files in background...");
    }

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {

      await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          onUploadProgress: (data) => {

            const percent = Math.round(
              (data.loaded * 100) / data.total
            );

            const updated = files.map((file) => ({
              name: file.name,
              progress: percent,
            }));

            setProgress(updated);

          },
        }
      );

      toast.success("Files uploaded successfully");

    } catch (error) {

      toast.error("Upload failed");

    }

  };

  return (

    <div className="min-h-screen bg-[#f5f7fb] p-6">

      <Toaster />

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

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Selected Files</h2>

          <p className="text-3xl font-bold mt-2 text-blue-600">
            {files.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Uploads</h2>

          <p className="text-3xl font-bold mt-2 text-green-500">
            {progress.length}
          </p>
        </div>
        {/* Notifications */}

<div className="bg-white rounded-2xl shadow p-6 mt-8">

  <h2 className="text-2xl font-bold text-blue-600 mb-5">
    Notifications
  </h2>

  {

    notifications.length === 0 ? (

      <p className="text-gray-500">
        No notifications yet
      </p>

    ) : (

      notifications.map((item, index) => (

        <div
          key={index}
          className="border-b py-3"
        >

          <p className="font-medium">
            {item.message}
          </p>

        </div>

      ))

    )

  }

</div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Notifications</h2>

          <p className="text-3xl font-bold mt-2 text-purple-500">
            {notifications.length}
          </p>
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
          onChange={handleFiles}
          className="mb-5"
        />

        <br />

        <button
          onClick={uploadFiles}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700"
        >
          Upload Files
        </button>

      </div>

      {/* Progress Bars */}

      <div className="mt-8 space-y-4">

        {progress.map((file, index) => (

          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow"
          >

            <div className="flex justify-between mb-2">
              <p className="font-medium">
                {file.name}
              </p>

              <p className="text-blue-600 font-bold">
                {file.progress}%
              </p>
            </div>

            <div className="w-full bg-gray-200 h-3 rounded-full">

              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{
                  width: `${file.progress}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

export default App;