// UploadThing config will be handled in the API route and frontend per UploadThing docs.
// This file is intentionally left empty or can export a placeholder if needed.
export {};

import { createUploadthing, type FileRouter } from 'uploadthing/next';

export const uploadThing = createUploadthing();

export const ourFileRouter = {
  groupImage: uploadThing({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { userId: "user_2Yg6XqQ6XQ6XQ6XQ6XQ6XQ6XQ6X" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 