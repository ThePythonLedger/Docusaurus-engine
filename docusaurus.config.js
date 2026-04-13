// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'The Python Ledger',
  tagline: 'Let`s learn Python',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://thepythonledger.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/Docusaurus-engine/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'The Python Ledger', // Usually your GitHub org/user name.
  projectName: 'Docusaurus-engine', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../the-python-ledger/curriculum', // Path to your local Markdown repo
          routeBasePath: '/', 
          sidebarPath: require.resolve('./sidebars.js'),
          // This allows students to click "Edit this page" and go to the content repo
          editUrl: ({ docPath }) => {
             return `https://github.com/razorblade23/the-python-ledger/edit/main/curriculum/${docPath}`;
           },
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/logo.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'The Python Ledger',
        logo: {
          alt: 'The python Ledger logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial',
          },
          {
            href: 'https://github.com/razorblade23/the-python-ledger',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'The Python Ledger',
            items: [
              {
                label: 'Curriculum',
                href: 'https://github.com/razorblade23/the-python-ledger',
              },
              {
                label: 'Engine',
                href: 'https://github.com/razorblade23/the-python-ledger-engine',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/r8G92r8m56',
              }
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Docusaurus',
                href: 'https://github.com/facebook/docusaurus',
              },
              {
                label: 'Skulpt',
                href: 'https://github.com/skulpt/skulpt',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} The Python Ledger. Built with Docusaurus and Skulpt.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
