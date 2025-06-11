#!/usr/bin/env node

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { z } from "zod";

const server = new McpServer({
  name: "auto-api",
  version: "1.0.0",
  description: "Auto API - YApi接口信息获取工具",
});

// YApi接口获取工具
server.tool(
  "yapi_get_interfaces",
  {
    url: z
      .string()
      .describe(
        "YApi分类页面URL，格式如：https://xxxxx.com/project/810/interface/api/cat_2783"
      ),
  },
  async ({ url }) => {
    try {
      // 1. 解析URL提取分类ID
      const urlPattern = /\/cat_(\d+)$/;
      const match = url.match(urlPattern);

      if (!match) {
        return {
          content: [
            {
              type: "text",
              text: "❌ URL格式错误，请提供正确的YApi分类页面URL，格式如：https://xxxxx.com/project/810/interface/api/cat_2783",
            },
          ],
        };
      }

      const catId = match[1];

      // 2. 构建API请求URL
      const apiUrl = `${process.env.BASE_URL}/api/interface/list_cat?page=1&limit=20&catid=${catId}`;

      // 3. 准备请求头
      const headers: Record<string, string> = {
        cookie: process.env.YAPI_COOKIE || "",
        accept: "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        referer: url,
        "sec-ch-ua":
          '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      };

      // 4. 发起请求
      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `❌ 请求失败：HTTP ${response.status} ${response.statusText}`,
            },
          ],
        };
      }

      const data = await response.json();

      // 5. 格式化返回结果
      if (data.errcode !== 0) {
        return {
          content: [
            {
              type: "text",
              text: `❌ API返回错误：${data.errmsg || "未知错误"}`,
            },
          ],
        };
      }

      const interfaces = data.data?.list || [];
      let result = `📋 分类ID ${catId} 的接口列表 (共${
        data.data?.total || 0
      }个):\n\n`;

      if (interfaces.length === 0) {
        result += "该分类下暂无接口";
      } else {
        interfaces.forEach((item: any, index: number) => {
          result += `${index + 1}. **${item.title}**\n`;
          result += `   • ID: \`${item._id}\` (用于获取详情)\n`;
          result += `   • 路径: ${item.method.toUpperCase()} ${item.path}\n`;
          result += `   • 链接: ${process.env.BASE_URL}/project/810/interface/api/${item._id}\n\n`;
        });
      }

      return {
        content: [{ type: "text", text: result }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 处理过程中发生错误：${
              error instanceof Error ? error.message : "未知错误"
            }`,
          },
        ],
      };
    }
  }
);

// YApi接口详情获取工具
server.tool(
  "yapi_get_interface_detail",
  {
    id: z.string().describe("接口ID，来自接口列表中的_id字段"),
    baseUrl: z
      .string()
      .optional()
      .describe("YApi基础URL，默认为 https://xxx.com"),
  },
  async ({ id, baseUrl = process.env.BASE_URL }) => {
    try {
      // 1. 构建详情API请求URL
      const apiUrl = `${baseUrl}/api/interface/get?id=${id}`;

      // 2. 准备请求头
      const headers: Record<string, string> = {
        cookie: process.env.YAPI_COOKIE || "",
        accept: "application/json, text/plain, */*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        referer: `${baseUrl}/project/810/interface/api/${id}`,
        "sec-ch-ua":
          '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      };

      // 3. 发起请求
      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `❌ 请求失败：HTTP ${response.status} ${response.statusText}`,
            },
          ],
        };
      }

      const data = await response.json();

      // 4. 格式化返回结果
      if (data.errcode !== 0) {
        return {
          content: [
            {
              type: "text",
              text: `❌ API返回错误：${data.errmsg || "未知错误"}`,
            },
          ],
        };
      }

      const interfaceData = data.data;
      if (!interfaceData) {
        return {
          content: [
            {
              type: "text",
              text: "❌ 未找到接口详情数据",
            },
          ],
        };
      }

      // 5. 生成详细信息
      let result = `📋 **接口详情**: ${interfaceData.title}\n\n`;

      // 请求体
      if (interfaceData.req_body_other) {
        result += `## 📝 请求体 (req_body_other)\n`;
        result += `\`\`\`json\n${interfaceData.req_body_other}\n\`\`\`\n\n`;
      } else {
        result += `## 📝 请求体 (req_body_other)\n`;
        result += `暂无请求体数据\n\n`;
      }

      // 响应体
      if (interfaceData.res_body) {
        result += `## 📥 响应体 (res_body)\n`;
        result += `\`\`\`json\n${interfaceData.res_body}\n\`\`\`\n\n`;
      } else {
        result += `## 📥 响应体 (res_body)\n`;
        result += `暂无响应体数据\n\n`;
      }

      // 接口链接
      result += `## 🔗 相关链接\n`;
      result += `- **在线文档**: ${baseUrl}/project/810/interface/api/${interfaceData._id}\n`;
      result += `- **Mock地址**: ${baseUrl}/mock/810${interfaceData.path}\n`;

      return {
        content: [{ type: "text", text: result }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 处理过程中发生错误：${
              error instanceof Error ? error.message : "未知错误"
            }`,
          },
        ],
      };
    }
  }
);

// Add a dynamic yapi resource
server.resource(
  "yapi",
  new ResourceTemplate("yapi://cat/{catId}", {
    list: undefined,
  }),
  async (uri, { catId }) => {
    const apiUrl = `${process.env.BASE_URL}/api/interface/list_cat?page=1&limit=20&catid=${catId}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/plain",
            text: `获取接口列表失败: ${error}`,
          },
        ],
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
