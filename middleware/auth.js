const jwt = require('jsonwebtoken');

function authMiddleware(options = {}) {
  return (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Token d'authentification manquant" });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (options.roles && Array.isArray(options.roles)) {
        if (!options.roles.includes(req.user.role)) {
          return res.status(403).json({ message: "Accès refusé : privilèges insuffisants" });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Token invalide" });
    }
  };
}

module.exports = authMiddleware;
