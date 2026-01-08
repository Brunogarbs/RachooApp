import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Token não informado" });
  }

  const [, jwtToken] = token.split(" ");

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
