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
  const [documents, setDocuments] = useState([]);

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
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

    fetchDocuments();
    fetchNotifications();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/documents"
      );

      setDocuments(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/notifications"
      );

      setNotifications(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select files");
      return;
    }

    if (files.length > 3) {
      toast(
        `Upload in progress — processing ${files.length} files in background.`
      );
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
              size: file.size,
              type: file.type,
              progress: percent,
              status:
                percent === 100
                  ? "complete"
                  : "uploading",
            }));

            setProgress(updated);
          },
        }
      );

      toast.success("Files uploaded successfully");

      fetchDocuments();
      fetchNotifications();
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

        <div className="relative">
          <button className="bg-blue-600 text-white px-5 py-3 rounded-xl shadow">
            🔔
          </button>

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
            {
              notifications.filter(
                (n) => !n.read
              ).length
            }
          </span>
        </div>
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

        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-gray-500">Notifications</h2>

          <p className="text-3xl font-bold mt-2 text-purple-500">
            {notifications.length}
          </p>
        </div>
      </div>

      {/* Upload Area */}

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

      {/* Progress */}

      <div className="mt-8 space-y-4">
        {progress.map((file, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow"
          >
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-medium">
                  {file.name}
                </p>

                <p className="text-sm text-gray-500">
                  {file.type}
                </p>
              </div>

              <div className="text-right">
                <p className="text-blue-600 font-bold">
                  {file.progress}%
                </p>

                <p className="text-sm text-gray-500 capitalize">
                  {file.status}
                </p>
              </div>
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

      {/* Notifications */}

      <div className="bg-white rounded-2xl shadow p-6 mt-8">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-blue-600">
            Notifications
          </h2>

          <button
            onClick={() => {
              const updated =
                notifications.map((n) => ({
                  ...n,
                  read: true,
                }));

              setNotifications(updated);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Mark All Read
          </button>
        </div>

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
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {item.message}
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        item.time
                      ).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const updated =
                        notifications.map((n, i) =>
                          i === index
                            ? {
                                ...n,
                                read: true,
                              }
                            : n
                        );

                      setNotifications(updated);
                    }}
                    className="text-blue-600 text-sm"
                  >
                    Mark Read
                  </button>
                </div>
              </div>
            ))
          )
        }
      </div>

      {/* Documents Table */}

      <div className="bg-white rounded-2xl shadow p-6 mt-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-5">
          Uploaded Documents
        </h2>

        {
          documents.length === 0 ? (
            <p className="text-gray-500">
              No uploaded documents
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-3">File Name</th>
                    <th>Size</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Download</th>
                  </tr>
                </thead>

                <tbody>
                  {
                    documents.map((doc, index) => (
                      <tr
                        key={index}
                        className="border-b"
                      >
                        <td className="py-4">
                          {doc.name}
                        </td>

                        <td>
                          {(doc.size / 1024).toFixed(2)} KB
                        </td>

                        <td>
                          {new Date(
                            doc.uploadedAt
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                            Complete
                          </span>
                        </td>

                        <td>
                          <a
                            href={`http://localhost:5000/${doc.path}`}
                            target="_blank"
                            className="text-blue-600 font-medium"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}

export default App;