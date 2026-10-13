# Medication Refill Planner · 药程

**Medication Refill Planner (药程)** is a mobile-first front-end prototype for medication inventory and refill scheduling.

> **项目状态：开发中（进行中的前端原型，尚未达到可供真实用药管理使用的状态）。**

> **安全与范围说明：**本项目仅为交互原型，不提供诊断、处方、剂量建议或真实医疗决策支持。页面中的药品名称、规格、数量和日期均为虚构演示数据。当前没有后端或本地持久化；刷新后，页面会恢复初始样例状态。请勿输入或提交真实患者信息。

## Demo

**Live demo:** [Medication Refill Planner](https://fangzhou26.github.io/medication-refill-planner/)

The demo uses fictional sample data only. It demonstrates the responsive dashboard, refill timeline, inventory coverage, and medication-detail interactions. It is not a medication recommendation or tracking service.

## 当前实现

- 今日概览：展示下一项示例提醒、未来 7 天和医院安排待确认提示。
- 取药计划：按月查看示例事件和 14 天库存覆盖；可切换“不自购 / 允许自购”展示状态。
- 药品列表与详情：查看虚构药品记录，并演示记录取药后的页面内库存变化。
- 无障碍与易读性：键盘焦点样式、语义化控件、大字模式和响应式手机布局。

## 技术栈

React 19、TypeScript、Vite 8、CSS、Oxlint。

## 本地运行

需要 Node.js 与 npm。

```bash
npm ci
npm run dev
```

开发服务器启动后，打开终端显示的本地地址。验证生产构建和静态检查：

```bash
npm run build
npm run lint
```

## 演示

本项目以固定的虚构日期 **2026-10-13** 展示日程，便于演示时结果稳定。页面里的预设取药日期是静态示例，不代表已确认的医院预约或真正由优化算法算出的建议。

## 当前限制与后续工作

- 数据只存在于 React 页面状态中，不会跨刷新保存。
- 取药日程和部分提醒仍是静态示例；“允许自购”方案尚未实现计算。
- 未实现账号、云同步、真实医院日历、提醒推送或完整的药品新增/编辑流程。
- 尚无自动化测试套件；本仓库目前以构建和 lint 作为基础验证。
- [SPEC.md](SPEC.md) 描述的是目标规格草案，不代表功能已全部完成。
