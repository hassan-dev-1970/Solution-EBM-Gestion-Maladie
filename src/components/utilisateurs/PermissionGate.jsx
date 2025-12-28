import { useAuth } from '../utilisateurs/AuthContext';

const PermissionGate = ({ permission, children }) => {
  const { user } = useAuth();

  if (!user || !user.permissions || !Array.isArray(user.permissions)) {
    return null;
  }

  return user.permissions.includes(permission) ? children : null;
};

export default PermissionGate;
