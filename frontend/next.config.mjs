const target=process.env.API_PROXY_TARGET||'http://localhost:4000';
/** @type {import('next').NextConfig} */
const nextConfig={
  images:{remotePatterns:[{protocol:'http',hostname:'localhost'},{protocol:'https',hostname:'leadhippo.ca'}]},
  async rewrites(){return [
    {source:'/api/:path*',destination:`${target}/api/:path*`},
    {source:'/uploads/:path*',destination:`${target}/uploads/:path*`}
  ];}
};
export default nextConfig;
