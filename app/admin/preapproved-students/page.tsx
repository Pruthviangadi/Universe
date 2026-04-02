"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { LiaSpinnerSolid } from "react-icons/lia";

interface PreApprovedStudent {
  id: string;
  email: string;
  usn: string;
  createdAt: string;
}

const PreApprovedStudentsPage = () => {
  const [students, setStudents] = useState<PreApprovedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({ email: "", usn: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{ email: string; usn: string }>({ email: "", usn: "" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/api/admin/preapproved-students");
      setStudents(response.data);
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.email || !newStudent.usn) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsAdding(true);
      await axios.post("/api/admin/preapproved-students", newStudent);
      toast.success("Student added successfully");
      setNewStudent({ email: "", usn: "" });
      fetchStudents();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Student with this email or USN already exists");
      } else {
        toast.error("Failed to add student");
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await axios.delete(`/api/admin/preapproved-students/${id}`);
      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  const handleEditClick = (student: PreApprovedStudent) => {
    setEditingId(student.id);
    setEditFields({ email: student.email, usn: student.usn });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id: string) => {
    try {
      setIsEditing(true);
      await axios.put(`/api/admin/preapproved-students/${id}`, editFields);
      toast.success("Student updated successfully");
      setEditingId(null);
      fetchStudents();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Student with this email or USN already exists");
      } else {
        toast.error("Failed to update student");
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LiaSpinnerSolid className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-3xl font-bold">Pre-Approved Students</h1>

      {/* Add New Student Form */}
      <form onSubmit={handleAddStudent} className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">Add New Student</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full rounded-lg border-2 border-gray-300 p-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">USN</label>
            <input
              type="text"
              value={newStudent.usn}
              onChange={(e) =>
                setNewStudent((prev) => ({ ...prev, usn: e.target.value }))
              }
              className="w-full rounded-lg border-2 border-gray-300 p-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isAdding}
        >
          {isAdding ? (
            <span className="flex items-center justify-center">
              <LiaSpinnerSolid className="mr-2 animate-spin" />
              Adding...
            </span>
          ) : (
            "Add Student"
          )}
        </button>
      </form>

      {/* Students List */}
      <div className="rounded-lg bg-white shadow-lg dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">USN</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Added On</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    {editingId === student.id ? (
                      <input
                        type="email"
                        name="email"
                        value={editFields.email}
                        onChange={handleEditChange}
                        className="rounded-lg border-2 border-gray-300 p-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    ) : (
                      student.email
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === student.id ? (
                      <input
                        type="text"
                        name="usn"
                        value={editFields.usn}
                        onChange={handleEditChange}
                        className="rounded-lg border-2 border-gray-300 p-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    ) : (
                      student.usn
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {editingId === student.id ? (
                      <>
                        <button
                          onClick={() => handleEditSave(student.id)}
                          className="text-green-600 hover:text-green-800 font-semibold"
                          disabled={isEditing}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="text-gray-500 hover:text-gray-700 font-semibold"
                          disabled={isEditing}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(student)}
                          className="text-blue-500 hover:text-blue-700 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PreApprovedStudentsPage; 