'use client';

import { Posts, Users } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface PostTableProps {
  posts: (Posts & {
    user: {
      name: string;
      email: string;
      imageUrl: string;
    };
  })[];
}

export default function PostTable({ posts }: PostTableProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      {/* Image Modal */}
      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalImage(null)} />
          <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-white text-2xl bg-black/50 rounded-full p-2 hover:bg-black/80"
              onClick={() => setModalImage(null)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <img
              src={modalImage}
              alt="Post full"
              className="rounded-xl shadow-xl max-h-[80vh] object-contain bg-white"
            />
          </div>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Content
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {posts.map((post) => (
            <tr key={post.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={post.user.imageUrl}
                      alt={post.user.name}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {post.user.name}
                    </div>
                    <div className="text-sm text-gray-500">{post.user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {post.text && (
                    <p className="truncate max-w-md">{post.text}</p>
                  )}
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post image"
                      className="h-20 w-20 object-cover rounded cursor-pointer border-2 border-transparent hover:border-blue-400 transition"
                      onClick={() => setModalImage(post.image)}
                    />
                  )}
                  {post.video && (
                    <video
                      src={post.video}
                      className="h-20 w-20 object-cover rounded"
                      controls
                    />
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {post.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  onClick={() => {
                    // TODO: Implement edit post
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={() => {
                    // TODO: Implement delete post
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 