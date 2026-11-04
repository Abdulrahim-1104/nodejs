import { logger } from "../config/logger.config";

export async function generateSession(req, res, user) {
  try {
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Store authenticated user's ID in session
    req.session.userId = user.id;

    console.log(req.session);

    // Save session before responding
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    logger.error(error);
  }
}
