import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditCommunityPageProps {
  params: {
    id: string;
  };
}

export default async function EditCommunityPage({ params }: EditCommunityPageProps) {
  const community = await prisma.community.findUnique({
    where: { id: params.id },
  });

  if (!community) {
    notFound();
  }

  return (
    <div>
      <h1>Edit Community: {community.name}</h1>
      {/* Add your edit form here */}
    </div>
  );
} 