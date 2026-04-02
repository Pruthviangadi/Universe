// Re-export the shared prisma singleton so both import styles work:
// import prisma from "@/lib/prisma"        (default)
// import { prisma } from "@/lib/db"        (named)
import prisma from "@/lib/prisma";

export { prisma };
export default prisma;
