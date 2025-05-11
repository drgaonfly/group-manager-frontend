// scripts/build.js
// const { execSync } = require('child_process');
import { glob } from "glob";
import { promises as fs } from "fs";
import { createWriteStream } from "fs";
import JavaScriptObfuscator from "javascript-obfuscator";
import { minify } from "terser";
import archiver from "archiver";
import { Client } from "ssh2";
import dotenv from "dotenv";
// import { readFileSync } from 'fs';

dotenv.config();

// 远程部署目录
const REMOTE_DEPLOY_PATH = "/www/wwwroot/mev-bot-frontend";

// 远程服务器配置
const sshConfig = {
  host: "154.23.175.169",
  port: 20088,
  username: "root",
  // 检查SSH私钥路径是否存在
  password: "rvPd2mAAzNx0",
};

// 清理并编译
// execSync('npm run build');

// 创建压缩包
async function createZipArchive() {
  await fs.mkdir("build", { recursive: true });

  const output = createWriteStream("build/dist.zip");
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  return new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory("dist/", false);
    archive.finalize();
  });
}

// 混淆和压缩
async function processFiles() {
  const files = glob.sync("dist/**/*.js");
  for (const file of files) {
    let code = await fs.readFile(file, "utf8");

    // 混淆
    code = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      stringArrayEncoding: ["rc4"],
    }).getObfuscatedCode();

    // 压缩
    const result = await minify(code, {
      compress: true,
      mangle: true,
    });
    if (result.error) throw result.error;

    await fs.writeFile(file, result.code);
  }

  await createZipArchive();

  await uploadAndExtract();
  // 上传并执行清理脚本
  // await uploadAndExecuteCleanScript();
}

// 上传并解压文件到远程服务器
async function uploadAndExtract() {
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn
      .on("ready", async () => {
        try {
          // 上传文件
          await new Promise((res, rej) => {
            conn.sftp((err, sftp) => {
              if (err) rej(err);
              const uploads = [
                {
                  src: "build/dist.zip",
                  dest: `${REMOTE_DEPLOY_PATH}/dist.zip`,
                },
              ];

              // 串行上传所有文件
              const uploadSequentially = async () => {
                for (const file of uploads) {
                  await new Promise((resolve, reject) => {
                    sftp.fastPut(file.src, file.dest, (err) => {
                      if (err) reject(err);
                      resolve();
                    });
                  });
                }
              };

              uploadSequentially().then(res).catch(rej);
            });
          });

          // 解压文件
          await new Promise((res, rej) => {
            conn.exec(
              `cd ${REMOTE_DEPLOY_PATH} && \
              rm -rf dist && \
              mkdir -p dist && \
              unzip -o dist.zip -d dist && \
              rm dist.zip`,
              (err, stream) => {
                if (err) rej(err);
                stream.on("close", res);
                stream.on("data", (data) => console.log("STDOUT: " + data));
                stream.stderr.on("data", (data) =>
                  console.error("STDERR: " + data),
                );
              },
            );
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          conn.end();
        }
      })
      .connect(sshConfig);
  });
}

// 上传并执行清理脚本
async function uploadAndExecuteCleanScript() {
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn
      .on("ready", async () => {
        try {
          // 上传清理脚本
          await new Promise((res, rej) => {
            conn.sftp((err, sftp) => {
              if (err) rej(err);
              sftp.fastPut(
                "scripts/clean.sh",
                `${REMOTE_DEPLOY_PATH}/clean.sh`,
                (err) => {
                  if (err) rej(err);
                  res();
                },
              );
            });
          });

          // 添加执行权限并运行清理脚本
          await new Promise((res, rej) => {
            conn.exec(
              `cd ${REMOTE_DEPLOY_PATH} && chmod u+x clean.sh && ./clean.sh`,
              (err, stream) => {
                if (err) rej(err);
                stream.on("close", res);
                stream.on("data", (data) =>
                  console.log("清理脚本输出: " + data),
                );
                stream.stderr.on("data", (data) =>
                  console.error("清理脚本错误: " + data),
                );
              },
            );
          });

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          conn.end();
        }
      })
      .connect(sshConfig);
  });
}

processFiles().catch(console.error);
