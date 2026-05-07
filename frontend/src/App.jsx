import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";
import { useDropzone } from "react-dropzone";

const socket = io("http://localhost:5000");

function App() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
      },
    });

  useEffect(() => {
    socket.on("new-notification", (data) => {
      toast.success(data.message);

      setNotifications((prev) => [data, ...prev]);
    });
  }, []);

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

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-600">
            Document Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Upload and manage company documents
          </p>
        </div>
      </div>

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

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Notifications</h2>

          <p className="text-3xl font-bold mt-2 text-purple-500">
            {notifications.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-10 text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-3">
          Upload PDF Documents
        </h2>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 cursor-pointer transition ${
            isDragActive
              ? "border-blue-600 bg-blue-50"
              : "border-blue-300 bg-white"
          }`}
        >
          <input {...getInputProps()} />

          {isDragActive ? (
            <p className="text-blue-600 text-lg font-bold">
              Drop PDF files here...
            </p>
          ) : (
            <div>
              <p className="text-gray-700 text-lg font-medium">
                Drag & drop PDF files here
              </p>

              <p className="text-gray-400 mt-2">
                or click to browse
              </p>
            </div>
          )}
        </div>

        <button
          onClick={uploadFiles}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 mt-6"
        >
          Upload Files
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {progress.map((file, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow"
          >
            <div className="flex justify-between mb-2">
              <p className="font-medium">{file.name}</p>

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

      <div className="bg-white rounded-2xl shadow p-6 mt-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-5">
          Notifications
        </h2>

        {notifications.length === 0 ? (
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
        )}
      </div>
    </div>
  );
}

export default App;