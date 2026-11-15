# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Default-Deny Safety Net**: Every document and collection path is denied by default (`match /{document=**} { allow read, write: if false; }`).
2. **Verified Authentication Required**: Every read and write operation requires `request.auth != null && request.auth.token.email_verified == true`. Unauthenticated or unverified accounts are rejected.
3. **Strict PII Isolation**: Phone numbers, NID numbers, passwords, security questions/answers, and wallet credentials reside exclusively under `/users/{userId}/private/account` and are readable/writable only by the owning UID (`request.auth.uid == userId`) or a verified admin.
4. **Privilege Escalation Prevention**: Non-admin users can only create `/users/{userId}` with `role == 'USER'` and cannot modify `role`, `uid`, `appUserId`, or `createdAt` on updates. Only a verified admin (`itbloggerbd24@gmail.com` with `email_verified == true` or listed in `/admins/{uid}`) can read/write `/adminSnapshots/{snapshotId}` or `/admins/{adminId}`.
5. **Temporal Integrity & Path Hardening**: All document IDs must match `^[a-zA-Z0-9_\\-]+$` with length `1..128`. `createdAt == request.time` is enforced on create, and `updatedAt == request.time` is enforced on update.

## 2. The "Dirty Dozen" Attack Payloads (All Must Fail with `PERMISSION_DENIED`)
1. **Unauthenticated Private Account Read**: Unauthenticated `GET /users/uid_123/private/account`.
2. **Unverified Email Admin Spoof**: Token with `email: 'itbloggerbd24@gmail.com'` and `email_verified: false` attempting `GET /adminSnapshots/latest`.
3. **Self-Assigned Admin Role Escalation**: Signed-in user creating `/users/uid_123` with `"role": "ADMIN"`.
4. **Update-Time Role Escalation**: Signed-in user updating `/users/uid_123` with `{"role": "ADMIN", "updatedAt": request.time}`.
5. **Shadow / Ghost Field Injection**: Signed-in user creating `/users/uid_123/private/account` with an extra field `"isVerified": true` or `"vipBypass": 999`.
6. **Identity Spoofing**: Signed-in user `uid_attacker` creating `/users/uid_victim` or setting `"uid": "uid_victim"` inside `/users/uid_attacker`.
7. **Other User PII Read**: Signed-in non-admin `uid_attacker` reading `/users/uid_victim/private/account`.
8. **Blanket User List Scraping**: Signed-in non-admin executing `collection('users')` query without `where('uid', '==', auth.uid)`.
9. **Client-Forged Timestamp**: Signed-in user creating `/users/uid_123` with `"createdAt": "2020-01-01T00:00:00Z"` instead of server timestamp `request.time`.
10. **Immortal Field Tampering**: Signed-in user updating `/users/uid_123` and altering `createdAt` or `appUserId`.
11. **Path Variable Poisoning**: Request targeting `/users/` + 500-character junk ID with invalid symbols (`..%2Fadmin`).
12. **Oversized Value / DoS Payload**: Signed-in user writing a 500KB string into `/users/uid_123` `displayName` exceeding `maxLength` (`120`).
