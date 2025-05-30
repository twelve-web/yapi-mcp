# Auto API - YApi MCP 服务

> 一个基于 Model Context Protocol (MCP) 的 YApi 接口信息获取工具

## 🚀 功能特性

- 📋 **接口列表获取**: 根据 YApi 分类页面 URL 获取接口列表
- 📝 **接口详情获取**: 根据接口 ID 获取详细的请求/响应体信息
- 🔧 **环境变量支持**: 支持通过环境变量配置认证信息
- 🛡️ **错误处理**: 完善的错误处理和用户友好的错误提示

## 📦 安装

### NPM 安装

```bash
npm install -g auto-api-mcp
```

### 本地开发

```bash
git clone https://github.com/twelve-web/auto-api-mcp.git
cd auto-api-mcp
npm install
npm run build
```

## 🔧 配置

创建 `.env` 文件并添加 YApi 认证信息（可选）：

```env
YAPI_COOKIE="_yapi_token=your_token_here; _yapi_uid=your_uid_here"
```

## 🎯 在 MCP 客户端中使用

### Claude Desktop 配置

在 `~/Library/Application Support/Claude/claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "auto-api-mcp": {
      "command": "auto-api",
      "env": {
        "YAPI_COOKIE": "_yapi_token=your_token; _yapi_uid=your_uid"
      }
    }
  }
}
```

### 其他 MCP 客户端

使用标准的 MCP 连接方式：

```bash
auto-api
```

## 🛠️ 可用工具

### 1. yapi_get_interfaces

获取指定分类下的接口列表

**参数:**

- `url` (string): YApi 分类页面 URL，格式如 `https://ertccc.com/project/810/interface/api/cat_2783`

**示例:**

```
工具: yapi_get_interfaces
参数: url = "https://ertccc.com/project/810/interface/api/cat_2783"
```

### 2. yapi_get_interface_detail

获取指定接口的详细信息（请求体和响应体）

**参数:**

- `id` (string): 接口 ID，来自接口列表中的 `_id` 字段
- `baseUrl` (string, 可选): YApi 基础 URL，默认为 `https://ertccc.com`

**示例:**

```
工具: yapi_get_interface_detail
参数: id = "13955"
```

## 📖 使用流程

1. **获取接口列表**: 使用 `yapi_get_interfaces` 获取分类下的所有接口
2. **复制接口 ID**: 从返回结果中找到需要的接口，复制其 `_id`
3. **获取接口详情**: 使用 `yapi_get_interface_detail` 获取详细信息
4. **生成类型定义**: 基于返回的请求/响应体生成 TypeScript 类型

## 🔗 资源

项目还提供动态资源支持：

- `yapi://cat/{catId}` - 获取指定分类的原始 JSON 数据

## 📄 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系

如有问题，请提交 Issue 或联系作者。
