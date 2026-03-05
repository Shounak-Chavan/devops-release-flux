import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Retrieves the complete audit log history for a specific feature flag.
 * * @async
 * @function getFlagAuditHistory
 * @param {import('express').Request} req - Express request object containing flagId in params.
 * @param {import('express').Response} res - Express response object.
 */
export const getFlagAuditHistory = async (req, res) => {
  const { flagId } = req.params;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Verify the user actually owns the flag via the Project relationship
    const flag = await prisma.flag.findFirst({
      where: { 
        id: flagId,
        project: { userId: userId } 
      }
    });

    if (!flag) {
      return res.status(404).json({ error: 'Flag not found or unauthorized' });
    }

    // 2. Fetch the logs
    const auditLogs = await prisma.auditLog.findMany({
      where: { flagId },
      include: {
        user: { select: { name: true, email: true } } // Show who made the change
      },
      orderBy: { timestamp: 'desc' } // Newest first
    });

    res.status(200).json({ auditLogs });
  } catch (error) {
    console.error('Get Audit Logs Error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};