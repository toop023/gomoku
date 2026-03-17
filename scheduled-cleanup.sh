#!/bin/bash

# 磁盘定时清理脚本
# 可以通过 cron 定时执行

set -e

# 配置
LOG_FILE="/root/clawd/logs/disk-cleanup.log"
BACKUP_DAYS=7  # 保留日志天数

# 创建日志目录
mkdir -p /root/clawd/logs

# 日志函数
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO" "$@"
}

log_warn() {
    log "WARN" "$@"
}

log_error() {
    log "ERROR" "$@"
}

# 清理函数
cleanup_target() {
    log_info "清理合约构建产物..."
    rm -rf /root/clawd/gomoku/contract/gomoku-token/programs/gomoku-token/target 2>/dev/null && \
        log_info "  ✅ 已清理 target 目录" || \
        log_warn "  ℹ️  target 目录不存在"
}

cleanup_npm_cache() {
    log_info "清理 npm 缓存..."
    npm cache clean --force --prefix=/root 2>/dev/null && \
        log_info "  ✅ 已清理 /root/.npm" || \
        log_warn "  ℹ️  npm 缓存已为空"
}

cleanup_system_cache() {
    log_info "清理系统缓存..."
    rm -rf /root/.cache/* 2>/dev/null && \
        log_info "  ✅ 已清理 /root/.cache" || \
        log_warn "  ℹ️  /root/.cache 已为空"

    rm -rf /tmp/* 2>/dev/null && \
        log_info "  ✅ 已清理 /tmp" || \
        log_warn "  ℹ️  /tmp 已为空"
}

cleanup_cargo_cache() {
    log_info "清理 Cargo 缓存..."
    rm -rf /root/.cargo/git/checkouts/* 2>/dev/null && \
        log_info "  ✅ 已清理 cargo git checkouts" || \
        log_warn "  ℹ️  cargo git checkouts 已为空"

    rm -rf /root/.cargo/registry/src/* 2>/dev/null && \
        log_info "  ✅ 已清理 cargo registry" || \
        log_warn "  ℹ️  cargo registry 已为空"

    rm -rf /root/.cargo/git/db/* 2>/dev/null && \
        log_info "  ✅ 已清理 cargo git db" || \
        log_warn "  ℹ️  cargo git db 已为空"

    rm -rf /root/.cargo/registry/index/* 2>/dev/null && \
        log_info "  ✅ 已清理 cargo registry index" || \
        log_warn "  ℹ️  cargo registry index 已为空"
}

cleanup_project_node_modules() {
    log_info "清理项目 node_modules..."
    rm -rf /root/clawd/gomoku/app/node_modules 2>/dev/null && \
        log_info "  ✅ 已清理 gomoku/app/node_modules" || \
        log_warn "  ℹ️  node_modules 不存在"
}

cleanup_old_logs() {
    log_info "清理旧日志（保留 ${BACKUP_DAYS} 天）..."

    # 清理清理脚本日志（保留最近 7 天）
    find "$LOG_FILE" -type f -name "*.log" -mtime +${BACKUP_DAYS} -delete 2>/dev/null && \
        log_info "  ✅ 已清理旧日志" || \
        log_warn "  ℹ️  没有旧日志"
}

show_disk_status() {
    log_info "磁盘状态："
    df -h /root | tee -a "$LOG_FILE"

    log_info "目录占用（Top 10）："
    du -sh /root/clawd 2>/dev/null | sort -rh | head -10 | tee -a "$LOG_FILE"

    local usage=$(df -h /root | tail -1 | awk '{print $5}' | sed 's/%//')
    local available=$(df -h /root | tail -1 | awk '{print $4}')

    log_info "使用率: ${usage}% | 可用空间: ${available}"

    # 判断磁盘使用等级
    local usage_num=$(echo "$usage" | sed 's/%//')
    local status="健康 🟢"

    if (( $(echo "$usage_num > 85" | bc -l 2>/dev/null || echo "0") )); then
        status="警告 🟡"
    elif (( $(echo "$usage_num > 90" | bc -l 2>/dev/null || echo "0") )); then
        status="危险 🟠"
    elif (( $(echo "$usage_num > 95" | bc -l 2>/dev/null || echo "0") )); then
        status="严重 🔴"
    fi

    log_info "磁盘状态: ${status}"
}

# 主清理函数
main_cleanup() {
    log_info "========================================="
    log_info "开始定时清理"
    log_info "========================================="

    local start_time=$(date +%s)

    # 1. 清理合约构建产物
    cleanup_target

    # 2. 清理 npm 缓存
    cleanup_npm_cache

    # 3. 清理系统缓存
    cleanup_system_cache

    # 4. 清理 Cargo 缓存
    cleanup_cargo_cache

    # 5. 清理项目 node_modules
    cleanup_project_node_modules

    # 6. 清理旧日志
    cleanup_old_logs

    # 7. 显示磁盘状态
    show_disk_status

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local duration_min=$((duration / 60))

    log_info "========================================="
    log_info "清理完成！"
    log_info "========================================="
    log_info "耗时: ${duration_min} 分钟"
}

# 执行清理
main_cleanup

# 检查磁盘使用率，如果超过阈值发送警报
check_disk_alert() {
    local usage=$(df -h /root | tail -1 | awk '{print $5}' | sed 's/%//')
    local usage_num=$(echo "$usage" | sed 's/%//')

    # 如果使用率超过 85%，发送警报
    if (( $(echo "$usage_num > 85" | bc -l 2>/dev/null || echo "0") )); then
        log_warn "⚠️  磁盘使用率过高: ${usage}%"
        log_warn "建议立即清理：/root/clawd/cleanup.sh"
    fi
}

# 检查磁盘使用
check_disk_alert
