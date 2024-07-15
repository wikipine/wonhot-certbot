/**
 * 证书生成服务
 */
import WebSocket, { WebSocketServer as WSWebSocketServer } from "ws";
import { execCommand } from "@/server/utils";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { DNSPodFactory } from "@/server/service/DNSPod";
import { CertStatusEnum } from "../enum";
import { CertModel } from "~/server/models/dao/cert.model";

export type CertParamsType = {
  cert_id: number;
  domain: string;
  email: string;
  dns_type: string;
  key_id: string;
  key_secret: string;
};

export class CertService {
  /**
   * 返回结果
   */
  private responseResult(step: number, message: string, success: boolean) {
    return JSON.stringify({
      step,
      message,
      success,
    });
  }

  // 创建证书服务
  async createCertServer(wsServerPort: number, params: CertParamsType) {
    const WebSocketServer = WebSocket.Server || WSWebSocketServer;
    const wsServer = new WebSocketServer({ port: wsServerPort });
    // 建立socket服务
    wsServer.on("connection", (ws) => {
      // 监听消息
      ws.on("message", (message) => {
        console.log("message:", message);
      });
      // 监听关闭
      ws.on("close", () => {
        console.log("WebSocket 连接已关闭，服务器停止");
        wsServer.close();
      });

      let certbotProcess: ChildProcessWithoutNullStreams;
      // 参数处理
      let commandParams = ["certonly"];
      // commandParams.push("--email " + params.email);
      // 域名处理
      params.domain.split(",").forEach((val: string) => {
        commandParams.push("-d " + val);
      });
      // 其他参数
      commandParams = commandParams.concat([
        "--manual",
        "--preferred-challenges",
        "dns",
        "--server",
        "https://acme-v02.api.letsencrypt.org/directory",
        "--config-dir",
        "./logs/cert",
        "--work-dir",
        "./logs/cert",
        "--logs-dir",
        "./logs/cert",
        "--register-unsafely-without-email",
        "--agree-tos",
        // '--non-interactive',
      ]);

      // 启动certbot操作进程
      certbotProcess = spawn("certbot", commandParams, {
        stdio: ["pipe", "pipe", "pipe"],
      });

      // 处理 Certbot 输出
      certbotProcess.stdout.on("data", async (data) => {
        const output = data.toString();
        console.log("进程输出" + new Date() + ": ", output);

        // 判断输出的值
        const dnsValueMatch = output.match(/with the following value:\s+(\S+)/);
        const isCertSuccess = output.includes("Successfully received certificate");
        const isCertNotRenewal = output.includes("Certificate not yet due for renewal");

        // 证书无需更新判断
        if (isCertNotRenewal) {
          ws.send(this.responseResult(5, "证书无需更新", true));
        }

        // 证书生成成功判断
        if (isCertSuccess) {
          await this.setCertGenreateSuccess(params.cert_id);
          ws.send(this.responseResult(5, "success", true));
        }

        // 进行DNS的校验
        if (dnsValueMatch) {
          const dnsValue = dnsValueMatch[1];
          ws.send(this.responseResult(2, "证书CODE为 " + dnsValue, true));
          // 过滤得到一级域名
          const regex = /\b[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}\b/g;
          const matchedDomains = params.domain.match(regex);
          const primaryDomain = matchedDomains?.find((domain) => {
            const parts = domain.split(".");
            return parts.length === 2;
          });
          if (!primaryDomain) {
            ws.send(this.responseResult(3, "根域名解析失败", false));
            return;
          }
          ws.send(this.responseResult(3, "正在进行域名设置", true));
          // 设置DNS值到对应云厂商
          try {
            const dnsPodInstance = DNSPodFactory.create(
              params.dns_type,
              params.key_id,
              params.key_secret
            );
            const res = await dnsPodInstance.addDomainRecord(
              primaryDomain,
              "_acme-challenge",
              "TXT",
              dnsValue
            );
            if (res) {
              ws.send(this.responseResult(3, "域名设置成功", true));
              ws.send(this.responseResult(4, "DNS校验中", true));
              // 校验解析是否生效，有成功或查询次数达到10次则退出
              let checkNum = 0;
              while (checkNum < 10) {
                try {
                  const result = await DNSPodFactory.getDomainDnsRecord(
                    primaryDomain,
                    "_acme-challenge"
                  );
                  const success = result?.some(
                    (record: any) =>
                      record.type === "TXT" &&
                      record.answer.some((answer: any) =>
                        answer.value.includes(dnsValue)
                      )
                  );
                  if (success) {
                    checkNum = 10;
                  } else {
                    checkNum += 1;
                  }
                } catch (error) {
                  checkNum += 1;
                }
              }
              ws.send(this.responseResult(4, "DNS校验完成", true));
              // 无论是否成功均按下回车进行下一步操作
              certbotProcess.stdin.write("\n");
            } else {
              ws.send(this.responseResult(3, "DNS设置失败", false));
            }
          } catch (e: any) {
            ws.send(this.responseResult(0, e.message, false));
          }
        }
      });

      // 错误不处理，仅做提示
      certbotProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      // 处理子进程退出 - 关闭链接
      certbotProcess.on("close", (code) => {
        ws.send(this.responseResult(0, `child process exited with code ${code}`, false));
      });
    });
  }

  /**
   * 设置证书创建成功
   * @param id
   */
  async setCertGenreateSuccess(id: number) {
    let updateData = {
      expired_at: new Date().getTime() + 86400 * 30 * 3 * 1000,
      status: CertStatusEnum.SUCCESS,
    };
    await CertModel.update(updateData, {
      where: {
        id: id,
      },
    });
  }
}
