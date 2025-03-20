import jwt from "jsonwebtoken";

export const authMiddleware = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    const token = req.header("Authorization");
    if (!token)
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });

    try {
      const decoded: any = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.JWT_SECRET as string
      );
      if (!roles.includes(decoded.role))
        return res.status(403).json({ message: "Access denied." });
      req.user = decoded;
      next();
    } catch (err) {
      res.status(400).json({ message: "Invalid token." });
    }
  };
};