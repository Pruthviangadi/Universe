import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getToken } from "next-auth/jwt";

const f = createUploadthing();

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "64MB" } })
    .middleware(async ({ req }) => {
      const token = await getToken({ req });

      if (!token) {
        throw new Error("Unauthorized");
      }

      return { userId: token.sub };
    })
    .onUploadComplete((data) => console.log("file", data)),

  imageUploader: f({ image: { maxFileSize: "16MB" } })
    .middleware(async ({ req }) => {
      const token = await getToken({ req });

      if (!token) {
        throw new Error("Unauthorized");
      }

      return { userId: token.sub };
    })
    .onUploadComplete((data) => console.log("file", data)),

  documentUploader: f({
    pdf: { maxFileSize: "32MB" },
    text: { maxFileSize: "32MB" },
    image: { maxFileSize: "32MB" },
  })
    .middleware(async ({ req }) => {
      const token = await getToken({ req });
      if (!token) throw new Error("Unauthorized");
      return { userId: token.sub };
    })
    .onUploadComplete((data) => console.log("file", data)),

  messageAttachment: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "16MB" },
    pdf: { maxFileSize: "8MB" },
    text: { maxFileSize: "4MB" },
  })
    .middleware(async ({ req }) => {
      const token = await getToken({ req });
      if (!token) throw new Error("Unauthorized");
      return { userEmail: token.email };
    })
    .onUploadComplete((data) => console.log("file", data)),

  chatDocumentUploader: f({
    pdf: { maxFileSize: "8MB" },
    text: { maxFileSize: "4MB" },
    image: { maxFileSize: "4MB" },
  })
    .middleware(async ({ req }) => {
      const token = await getToken({ req });
      if (!token) throw new Error("Unauthorized");
      return { userId: token.sub };
    })
    .onUploadComplete((data) => console.log("file", data)),
};

export type OurFileRouter = typeof ourFileRouter;
