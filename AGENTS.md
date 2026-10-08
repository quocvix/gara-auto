<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Quy Tắc Điều Hướng Mã Nguồn & Tối Ưu Token (CodeGraph First)

- **Bắt buộc ưu tiên CodeGraph**: Dự án đã được index sẵn với `.codegraph/`. Khi phân tích, suy nghĩ, tìm kiếm code, component, luồng dữ liệu (data flow) hay quan hệ giữa các hàm/symbol: **LUÔN LUÔN gọi CodeGraph trước tiên** (dùng MCP tool `codegraph_explore` hoặc lệnh `codegraph explore "<symbol/câu hỏi>"`).
- **Tối ưu hóa Token**: TUYỆT ĐỐI TRÁNH việc quét grep diện rộng hoặc dùng `view_file` đọc toàn bộ các file lớn khi chưa định vị cụ thể. CodeGraph gom gọn verbatim source code và call-path chỉ trong 1 lần truy vấn, giúp giảm thiểu tối đa token bị hao hụt.
- **Quy trình làm việc**:
  1. Định vị và phân tích symbol bằng `codegraph_explore`.
  2. Chỉ đọc (`view_file`) hoặc sửa (`replace_file_content`) đúng phạm vi dòng và file đã được xác định.
