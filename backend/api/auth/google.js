import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default function handler(req, res) {
  console.log('API route hit:', req.url);
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);

  try {
    console.log('Google auth API route hit');
    console.log('Request method:', req.method);
    console.log('Request body:', JSON.stringify(req.body)); // Stringify the body for better logging

    if (req.method === 'POST') {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ message: 'ID token is required' });
      }

      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, name, picture } = payload;

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create a new user if they don't exist
        user = await prisma.user.create({
          data: {
            email,
            username: name,
            profilePictureUrl: picture,
          },
        });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.status(200).json({
        token,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl,
      });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in Google authentication:', error);
    res.status(400).json({ message: 'Authentication failed', error: error.message });
  } finally {
    await prisma.$disconnect();
  }
}
