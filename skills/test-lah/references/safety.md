# Safety on a shared or staging environment

Ask first, before anything that touches a live system (real email, payments, device control, renewing credentials, balance adjustments on real accounts).

- All test data carries a `qa-` prefix. Delete it through the API in a `finally` block. Never change or delete real data; list the protected records in the profile file.
- Settings pages: do not save real values. Intercept write requests in the browser and answer with fake responses; record the payload only (never secrets). Label such results "WITH FAKE API RESPONSE": they are not evidence of backend behavior.
- Permission checks on the server: send a deliberately invalid body. 403 means permission is enforced. 400, 422 or 500 means the body was validated first and permission was not enforced. Never send a valid body with a low-privilege token.
- Never print or copy passwords, secret keys or tokens; record only length. Read credentials from environment variables. Never store them in a file.
- Use a disposable inbox (for example mail.tm) for email tests, not a personal mailbox.
- Soft deletes leave residue. Do not re-run write runners without need; list leftover test data in the profile file.
- Actions an automatic classifier blocks even with user consent: hand them to the user.
