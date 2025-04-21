const { config } = require("@fortawesome/fontawesome-svg-core");

module.exports = {
  transpileDependencies: [],
  outputDir: 'app',


  pages: {
      index: {
          entry: 'src/main.js',
          template: './src/index.html',
          filename: 'index.html',
      }
  },
  devServer:{
      host: '0.0.0.0',
  port: 8080,
  allowedHosts: 'all',
//   public:
//   process.env.GITPOD_WORKSPACE_URL ? 
//   process.env.GITPOD_WORKSPACE_URL.replace('https://', 'https://8080-'): 'localhost:8080',
  client:{
    webSocketURL:{
      hostname: '0.0.0.0',
      pathname: '/ws',
      port: 443
    },
  },
      proxy:{
          '/api': {
              target: 'http://localhost:3000',
              changeOrigin: true,
              // pathRewrite:{ '^/api': ''}
          }
      },
  },
  publicPath: './'  
}



