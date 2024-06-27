/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        ppr: 'incremental',
    },

    webpack: config => {
        // Fixes npm packages that depend on `fs` module
        // config.resolve.fallback = { fs: false };

        config.module.rules.push({
            test: /\.node$/,
            use: [
                {
                    loader: 'nextjs-node-loader',
                    options: {
                        outputPath: config.output.path,
                    },
                },
            ],
        })

        return config
    },
}

module.exports = nextConfig
