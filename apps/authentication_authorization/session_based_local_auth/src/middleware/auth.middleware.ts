export function verifyAuth(req, res, next) {
  console.log("Cookie", req.cookies);
  console.log("Session ID:", req.sessionID);
  console.log("Session:", req.session);
  console.log("User ID:", req.session.userId);
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Please login first",
    });
  }

  next();
}
