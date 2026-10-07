/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/recommendations",
        destination: "/remediations",
        permanent: true,
      },
      {
        source: "/remediation",
        destination: "/remediations",
        permanent: true,
      },
      {
        source: "/onboarding",
        destination: "/risk-assessment",
        permanent: true,
      },
      {
        source: "/broadcast/create",
        destination: "/outreach/create",
        permanent: true,
      },
      {
        source: "/broadcast/follow-up",
        destination: "/outreach/follow-up",
        permanent: true,
      },
      {
        source: "/broadcast",
        destination: "/outreach/create",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
