# 使用 Python 内置的服务器

如果你的电脑上安装了 Python 3，使用`python3 server.py`命令启动服务器。

# 使用 Node.js 内置的服务器（我本地已经安装了python3，这里只介绍使用 Node.js 内置的服务器使用）

1. 安装命令：
   ```bash
   npm init -y
   npm install express
   ```
2. 创建一个名为 server.js 的文件
3. 在 server.js 文件中添加以下代码：

   ```javascript
   const express = require("express");
   const path = require("path");
   const app = express();
   const port = 8080; // 你可以选择任何未被使用的端口

   // 添加必需的头信息，以启用跨域隔离
   app.use((req, res, next) => {
     res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
     res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
     next();
   });

   // 托管静态文件 (html, js, css)
   app.use(express.static(path.join(__dirname, "/")));

   app.listen(port, () => {
     console.log(`服务器运行在 http://localhost:${port}`);
   });
   ```

4. 启动服务器：
   ```bash
   node server.js
   ```
5. 打开浏览器，访问 `http://localhost:8080`即可查看效果。
