# Lessons Learned

- **Firestore Limitations**: Avoid saving base64 strings to Firestore as they easily hit the 1MB document limit. Always use Firebase Storage for user uploads.
- **Zero-Trust Rules**: Ensure Firebase Security Rules strictly mirror the precise schema and allow for atomic updates to arrays using `affectedKeys().hasOnly()`. Remove deprecated or unused keys (like likesCount/commentsCount) if they are not in the validated schema.
