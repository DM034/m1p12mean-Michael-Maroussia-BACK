const jwt = require('jsonwebtoken');

/**
 * Middleware générique pour protéger les routes.
 * Vérifie le token JWT et (optionnellement) les rôles autorisés.
 * 
 * @param {Object} options - Options de configuration du middleware.
 * @param {Array} options.roles - (Optionnel) Liste des rôles autorisés à accéder à la route.
 * @returns {Function} Middleware Express.
 */
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
        if (!options.roles.includes(decoded.role)) {
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
