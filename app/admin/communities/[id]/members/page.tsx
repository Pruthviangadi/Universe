import prisma from "@/lib/prisma"; 
import { notFound } from "next/navigation";

interface MembersPageProps {
  params: {
    id: string;
  };
}

export default async function MembersPage({ params }: MembersPageProps) {
  const community = await prisma.community.findUnique({
    where: { id: params.id },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true
        }
      }
    }
  });

  if (!community) {
    notFound();
  }

  return (
    <div>
      <h1>Community Members: {community.name}</h1>
      <div className="space-y-4">
        {community.members.map((member) => (
          <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 