import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/campaigns/:path*",
    "/segments/:path*",
    "/api/campaigns/:path*",
    "/api/segments/:path*",
  ],
}; 