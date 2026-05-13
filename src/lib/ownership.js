export function getUserId(user) {
  return user?.id || user?.user_id || user?.email || user?.created_by || null;
}

export function getUserEmail(user) {
  return user?.email || user?.user_email || user?.created_by || null;
}

export function getOwnerFields(user) {
  return {
    owner_user_id: getUserId(user),
    owner_email: getUserEmail(user),
  };
}

export function normalizeShareList(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function isOwnedByUser(record, user) {
  const userId = getUserId(user);
  const email = getUserEmail(user);
  if (!record) return false;
  if (record.owner_user_id && userId && record.owner_user_id === userId) return true;
  if (record.owner_email && email && record.owner_email === email) return true;
  if (record.created_by && email && record.created_by === email) return true;
  return false;
}

export function isSharedWithUser(record, user) {
  const userId = getUserId(user);
  const email = getUserEmail(user);
  const sharedUserIds = normalizeShareList(record?.shared_with_user_ids);
  const sharedEmails = normalizeShareList(record?.shared_with_emails).map((item) => item.toLowerCase());
  return Boolean(
    (userId && sharedUserIds.includes(userId)) ||
    (email && sharedEmails.includes(email.toLowerCase()))
  );
}

export function canAccessAIFace(face, user) {
  return isOwnedByUser(face, user) || isSharedWithUser(face, user);
}

export function canEditAIFace(face, user) {
  return isOwnedByUser(face, user);
}

export function filterAccessibleAIFaces(faces = [], user) {
  return faces.filter((face) => canAccessAIFace(face, user));
}
