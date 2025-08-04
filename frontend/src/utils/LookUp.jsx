export default {
  DefaultFile: {
    "/vercel.json": {
      code: `{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
`,
    },
    "/package.json": {
      code: `{
   "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
   "dependencies": {},
  "devDependencies": {}
}
`,
    },
  },
};
