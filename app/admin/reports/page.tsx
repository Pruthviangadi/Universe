'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  post: {
    id: string;
    text: string;
    image: string | null;
    video: string | null;
    user: {
      name: string;
      email: string;
      imageUrl: string;
    };
    isHidden: boolean;
  };
  reporter: {
    name: string;
    email: string;
    imageUrl: string;
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedContent, setSelectedContent] = useState<{
    text?: string;
    image?: string | null;
    video?: string | null;
  } | null>(null);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`/api/post/report?status=${filter}`);
      setReports(response.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      await axios.put('/api/post/report', {
        id: reportId,
        status: newStatus,
      });
      toast.success('Report status updated');
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus }
          : report
      ));
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Failed to update report status');
    }
  };

  const handleHidePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'hide' })
      });

      if (response.ok) {
        toast.success('Post hidden successfully');
        setReports(reports.map(report => 
          report.post.id === postId 
            ? { ...report, post: { ...report.post, isHidden: true } }
            : report
        ));
      } else {
        toast.error('Failed to hide post');
      }
    } catch (error) {
      console.error('Error hiding post:', error);
      toast.error('Failed to hide post');
    }
  };

  const handleRestorePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'restore' })
      });

      if (response.ok) {
        toast.success('Post restored successfully');
        setReports(reports.map(report => 
          report.post.id === postId 
            ? { ...report, post: { ...report.post, isHidden: false } }
            : report
        ));
      } else {
        toast.error('Failed to restore post');
      }
    } catch (error) {
      console.error('Error restoring post:', error);
      toast.error('Failed to restore post');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  if (loading) {
    return <div>Loading reports...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reported Posts</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reporter
              </th>
              <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Post Author
              </th>
              <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th className="w-64 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reported
              </th>
              <th className="w-48 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="w-48 px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={report.reporter.imageUrl}
                      alt={report.reporter.name}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {report.reporter.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.reporter.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="w-48 px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={report.post.user.imageUrl}
                      alt={report.post.user.name}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {report.post.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.post.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td 
                  className="w-64 px-6 py-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedContent({
                    text: report.post.text,
                    image: report.post.image,
                    video: report.post.video
                  })}
                >
                  <div className="text-sm text-gray-900">
                    {report.post.text && (
                      <p className="truncate max-w-xs">{report.post.text}</p>
                    )}
                    {report.post.image && (
                      <img
                        src={report.post.image}
                        alt="Post content"
                        className="h-20 w-20 object-cover rounded mt-2"
                      />
                    )}
                    {report.post.video && (
                      <div className="mt-2 text-blue-600">
                        Video content (click to view)
                      </div>
                    )}
                  </div>
                </td>
                <td className="w-64 px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <p className="font-medium capitalize">{report.reason}</p>
                    <p className="text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                  </div>
                </td>
                <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(report.createdAt), {
                    addSuffix: true,
                  })}
                </td>
                <td className="w-48 px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-2">
                    {report.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(report.id, 'reviewed')}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Mark as Reviewed
                      </button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="font-medium"
                        >
                          {report.post.isHidden ? 'Restore' : 'Hide'} Post
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {report.post.isHidden ? 'Restore' : 'Hide'} Post
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {report.post.isHidden 
                              ? 'This will make the post visible to all users again.' 
                              : 'This will hide the post from all users, including the creator.'}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => report.post.isHidden 
                              ? handleRestorePost(report.post.id)
                              : handleHidePost(report.post.id)}
                          >
                            {report.post.isHidden ? 'Restore' : 'Hide'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Post Content</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                {selectedContent?.text && (
                  <div className="text-base text-gray-900 whitespace-pre-wrap">
                    {selectedContent.text}
                  </div>
                )}
                {selectedContent?.image && (
                  <div className="flex justify-center">
                    <img
                      src={selectedContent.image}
                      alt="Post content"
                      className="max-h-[500px] w-auto object-contain rounded"
                    />
                  </div>
                )}
                {selectedContent?.video && (
                  <div className="flex justify-center">
                    <ReactPlayer
                      url={selectedContent.video}
                      controls={true}
                      width="100%"
                      height="auto"
                    />
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 