export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/documents/:path*", "/search/:path*", "/settings/:path*"],
};
