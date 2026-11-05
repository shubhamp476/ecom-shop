# Deployment and database status

Updated 4 November 2026.

- PyMongo is configured locally with the user-provided Atlas URI. Credentials are stored only in ignored `.env.local`.
- Atlas authenticated ping passed. Live insert, retrieval, ObjectId serialization, duplicate-SKU rejection, zero-stock update, aggregation and deletion passed in a newly created temporary collection. That temporary collection was removed.
- The previously empty application database was initialized with the existing project catalog: 20 products and five categories. Setup uses `$setOnInsert` and preserves existing records.
- The frontend production build and Netlify adapter build passed.
- Netlify site: https://ecom-shop-shubham-12314083.netlify.app . The site was created, but publishing did not complete. Do not treat this URL as a verified live deployment.
- The prepared Netlify preview uses explicit read-only demo mode. It does not host the Python API or provide live administrative operations.
- The Python API still requires a separate host. `render.yaml` and `backend/Dockerfile` are ready. No Render account credentials or hosted API URL were supplied.

To enable the full live application: deploy the Python service, configure its Atlas URI and backend API key, verify `/health/ready`, then set Netlify `BACKEND_URL`, `BACKEND_API_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `DEMO_MODE=false` and redeploy.

Deployment safety: the original local build archive was rejected because it contained `.env.local`; that generated archive was removed. A fresh frontend-only staging build contains no dotenv files. A scan of 4,660 deployment entries found no live Atlas URI. Database credentials must remain on the Python host and never be uploaded with the frontend.

Final publish outcome: blocked by TLS certificate verification errors during Netlify deploy-store upload (`SELF_SIGNED_CERT_IN_CHAIN` / curl error 60). The clean Next.js and adapter build passed. No TLS verification was disabled. Retry publishing from a network/runtime with a valid trust chain.
