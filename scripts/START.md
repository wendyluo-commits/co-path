# 打不开 localhost 的解决办法

## 原因

本机「同时可打开的文件数」默认偏小，Next 开发模式会监听大量文件，容易触发 **EMFILE (too many open files)**，导致路由没被正确注册，访问时出现 **404 / 打不开**。

---

## 方法一：用脚本启动（推荐）

**务必在本机终端（如 Mac 的「终端」或 iTerm）里执行**，不要用 Cursor 内置终端：

```bash
cd /Users/wendyluo/tarot-reading-app
bash scripts/dev.sh
```

等出现 `Local: http://localhost:3000`（或 3001、3002）后，用浏览器打开该地址。

---

## 方法二：先提高限制再启动

在本机终端依次执行：

```bash
ulimit -n 10240
cd /Users/wendyluo/tarot-reading-app
npm run dev
```

（若提示找不到 `node`，先执行：`export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use default`）

---

## 方法三：用生产模式运行（不热更新）

不需要改 ulimit，但每次改代码后要重新 build：

```bash
cd /Users/wendyluo/tarot-reading-app
npm run build
npm run start
```

然后在浏览器打开终端里显示的地址（一般是 http://localhost:3000）。

---

## 注意

- 以终端里实际打印的 **Local:** 地址为准（可能是 3000、3001、3002 等）。
- 关掉运行 `npm run dev` 或 `npm run start` 的终端窗口，服务就会停，页面会打不开。
