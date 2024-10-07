import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req, res) {
  console.log('Google auth handler called');
  console.log('Request method:', req.method);
  console.log('Request body:', req.body);

  if (req.method === 'POST') {
    try {
      const { idToken } = req.body;
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
    } catch (error) {
      console.error('Error in Google authentication:', error);
      res.status(400).json({ message: 'Invalid token' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
