// scripts/build.js
// const { execSync } = require('child_process');
import { promises as fs } from "fs";
import { createWriteStream } from "fs";
import archiver from "archiver";
import { Client } from "ssh2";
import "@dotenvx/dotenvx/config";
import cliProgress from "cli-progress";
// import { readFileSync } from 'fs';

// 远程部署目录
const REMOTE_DEPLOY_PATH = "/www/wwwroot/account-bot-frontend";

// 检查SSH私钥路径是否存在
console.log(process.env.SSH_PASSWORD);
console.log(process.env.SSH_HOST);

if (!process.env.SSH_PASSWORD || !process.env.SSH_HOST) {
  console.error("请设置SSH_PRIVATE_KEY_PATH和SSH_HOST环境变量");
  process.exit(1);
}

// 远程服务器配置
const sshConfig = {
  host: process.env.SSH_HOST,
  port: 20088,
  username: "root",
  // 检查SSH私钥路径是否存在
  password: process.env.SSH_PASSWORD,
};

// 创建压缩包
async function createZipArchive() {
  console.log("📦 创建压缩包...");
  await fs.mkdir("build", { recursive: true });

  const output = createWriteStream("build/dist.zip");
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(100, 0);

  archive.on("progress", (progress) => {
    const percent = Math.round(
      (progress.fs.processedBytes / progress.fs.totalBytes) * 100,
    );
    bar.update(percent);
  });

  return new Promise((resolve, reject) => {
    output.on("close", () => {
      bar.stop();
      console.log("✅ 压缩包创建完成");
      resolve();
    });
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory("dist/", false);
    archive.finalize();
  });
}

// 混淆和压缩
async function processFiles() {
  // 由于不再需要处理JS文件,直接执行打包和上传
  console.log("🚀 开始部署流程...");

  await createZipArchive();
  await uploadAndExtract();
  // 上传并执行清理脚本
  // await uploadAndExecuteCleanScript();

  console.log("✅ 部署流程完成");
}

// 上传并解压文件到远程服务器
async function uploadAndExtract() {
  console.log("📤 开始上传文件到服务器...");
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

              const bar = new cliProgress.SingleBar(
                {},
                cliProgress.Presets.shades_classic,
              );
              bar.start(100, 0);

              // 串行上传所有文件
              const uploadSequentially = async () => {
                for (const file of uploads) {
                  await new Promise((resolve, reject) => {
                    let lastPercent = 0;
                    sftp.fastPut(
                      file.src,
                      file.dest,
                      {
                        step: (transferred, chunk, total) => {
                          const percent = Math.round(
                            (transferred / total) * 100,
                          );
                          if (percent > lastPercent) {
                            bar.update(percent);
                            lastPercent = percent;
                          }
                        },
                      },
                      (err) => {
                        if (err) reject(err);
                        bar.stop();
                        console.log("✅ 文件上传完成");
                        resolve();
                      },
                    );
                  });
                }
              };

              uploadSequentially().then(res).catch(rej);
            });
          });

          console.log("📂 解压文件...");
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
                stream.on("close", () => {
                  console.log("✅ 文件解压完成");
                  res();
                });
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
  console.log("🧹 上传清理脚本...");
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
                  console.log("✅ 清理脚本上传完成");
                  res();
                },
              );
            });
          });

          console.log("🚀 执行清理脚本...");
          // 添加执行权限并运行清理脚本
          await new Promise((res, rej) => {
            conn.exec(
              `cd ${REMOTE_DEPLOY_PATH} && chmod u+x clean.sh && ./clean.sh`,
              (err, stream) => {
                if (err) rej(err);
                stream.on("close", () => {
                  console.log("✅ 清理脚本执行完成");
                  res();
                });
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
