import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { metablock } from 'vite-plugin-userscript';

const data = fs.readFileSync('./package.json', 'utf8');
const packageConfig = JSON.parse(data);

export default defineConfig({
    plugins: [
        metablock({
            file: './metablock.yml',
            override: {
                name: {
                    default: 'BigCommerce Auto Puller',
                },
                namespace: packageConfig.author.url,
                version: packageConfig.version,
                author: packageConfig.author.name,
                description: {
                    default: packageConfig.description,
                },
                homepageURL: packageConfig.homepage,
                icon: 'https://icons.duckduckgo.com/ip2/bcm78789.com.ico',
                updateURL:
                    'https://raw.githubusercontent.com/D3strukt0r/BigCommerce-Auto-Grabber/master/src/index.user.js',
                downloadURL:
                    'https://raw.githubusercontent.com/D3strukt0r/BigCommerce-Auto-Grabber/master/src/index.user.js',
                supportURL: packageConfig.bugs.url,
                contributionURL: packageConfig.funding[1].url,
                include: '/^https?://(www.)?bcm[0-9]{5}.com/',
                require: 'https://openuserjs.org/src/libs/sizzle/GM_config.js',
                grant: ['GM_getValue', 'GM_setValue'],
                license: packageConfig.license,
            },
        }),
    ],
    build: {
        lib: {
            entry: path.resolve(
                path.dirname(fileURLToPath(import.meta.url)),
                'src/main.ts'
            ),
            name: packageConfig.name,
            formats: ['es', 'cjs', 'umd'],
            fileName: (format) => `${packageConfig.name}.${format}.user.js`,
        },
    },
    rollupOptions: {
        output: {
            extend: true,
            format: 'umd',
        },
    },
});
