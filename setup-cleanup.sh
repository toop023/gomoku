#!/bin/bash

# 定时清理快速配置脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  定时清理配置脚本${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_option() {
    local num=$1
    local desc=$2
    echo -e "  ${GREEN}${num}${NC}. ${desc}"
}

print_success() {
    echo -e "  ${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "  ${RED}✗ $1${NC}"
}

print_info() {
    echo -e "  ${YELLOW}ℹ️  $1${NC}"
}

# 显示菜单
show_menu() {
    print_header
    echo -e "${BLUE}选择定时清理频率：${NC}"
    echo ""
    print_option "1" "每日清理（凌晨 2 点）- 推荐"
    print_option "2" "每 6 小时清理（00:00, 06:00, 12:00, 18:00）"
    print_option "3" "每周清理（周一凌晨 3 点）"
    print_option "4" "每小时清理（不推荐）"
    print_option "5" "仅检查磁盘（不清理）"
    print_option "6" "查看当前配置"
    print_option "7" "删除定时任务"
    print_option "0" "退出"
    echo ""
}

# 配置每日清理
setup_daily() {
    print_success "配置每日清理（凌晨 2 点）"
    (crontab -l 2>/dev/null | grep -q scheduled-cleanup.sh) && \
        print_info "定时任务已存在，正在更新..." || \
        print_info "添加新的定时任务..."

    (crontab -l 2>/dev/null; echo "0 2 * * * /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1") | crontab -

    print_success "配置完成！"
    show_current_config
}

# 配置每 6 小时清理
setup_every_6h() {
    print_success "配置每 6 小时清理"
    (crontab -l 2>/dev/null | grep -q scheduled-cleanup.sh) && \
        print_info "定时任务已存在，正在更新..." || \
        print_info "添加新的定时任务..."

    (crontab -l 2>/dev/null; echo "0 */6 * * * /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1") | crontab -

    print_success "配置完成！"
    show_current_config
}

# 配置每周清理
setup_weekly() {
    print_success "配置每周清理（周一凌晨 3 点）"
    (crontab -l 2>/dev/null | grep -q scheduled-cleanup.sh) && \
        print_info "定时任务已存在，正在更新..." || \
        print_info "添加新的定时任务..."

    (crontab -l 2>/dev/null; echo "0 3 * * 0 /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1") | crontab -

    print_success "配置完成！"
    show_current_config
}

# 配置每小时清理
setup_hourly() {
    print_error "每小时清理不推荐！"
    echo "  这会频繁占用系统资源"
    read -p "  是否继续？(y/n): " choice

    if [[ $choice =~ ^[Yy]$ ]]; then
        print_info "配置每小时清理..."
        (crontab -l 2>/dev/null | grep -q scheduled-cleanup.sh) && \
            print_info "定时任务已存在，正在更新..." || \
            print_info "添加新的定时任务..."

        (crontab -l 2>/dev/null; echo "0 * * * * /root/clawd/scheduled-cleanup.sh >> /root/clawd/logs/scheduled-cleanup.log 2>&1") | crontab -

        print_success "配置完成！"
        show_current_config
    fi
}

# 配置仅检查
setup_check_only() {
    print_success "配置仅检查磁盘（不清理）"

    # 需要创建一个仅检查的脚本
    cat > /root/clawd/check-disk.sh << 'EOF'
#!/bin/bash
df -h /root
du -sh /root/clawd | sort -rh | head -10
EOF

    chmod +x /root/clawd/check-disk.sh

    (crontab -l 2>/dev/null | grep -q check-disk.sh) && \
        print_info "定时任务已存在，正在更新..." || \
        print_info "添加新的定时任务..."

    (crontab -l 2>/dev/null; echo "0 */6 * * * /root/clawd/check-disk.sh >> /root/clawd/logs/disk-check.log 2>&1") | crontab -

    print_success "配置完成！"
    show_current_config
}

# 显示当前配置
show_current_config() {
    echo ""
    print_info "当前定时任务："
    crontab -l 2>/dev/null | grep -E "(scheduled-cleanup|check-disk)" || \
        print_info "没有配置定时任务"

    echo ""
    print_info "磁盘状态："
    df -h /root | tail -1
}

# 删除定时任务
remove_cron() {
    print_success "删除定时任务..."

    crontab -l 2>/dev/null | grep -v -E "(scheduled-cleanup|check-disk)" | crontab -

    print_success "定时任务已删除！"
    show_current_config
}

# 测试清理脚本
test_cleanup() {
    print_success "测试清理脚本..."

    if [ ! -f "/root/clawd/scheduled-cleanup.sh" ]; then
        print_error "清理脚本不存在：/root/clawd/scheduled-cleanup.sh"
        return 1
    fi

    echo ""
    print_info "手动执行一次清理..."

    /root/clawd/scheduled-cleanup.sh

    print_success "测试完成！"
    echo ""
    read -p "按回车键返回菜单..." dummy
}

# 主菜单
main() {
    while true; do
        clear
        show_menu

        read -p "请选择 [0-7]: " choice

        case $choice in
            1)
                setup_daily
                ;;
            2)
                setup_every_6h
                ;;
            3)
                setup_weekly
                ;;
            4)
                setup_hourly
                ;;
            5)
                setup_check_only
                ;;
            6)
                show_current_config
                ;;
            7)
                remove_cron
                ;;
            0)
                print_success "退出"
                exit 0
                ;;
            *)
                print_error "无效选择，请重试"
                ;;
        esac

        echo ""
        read -p "按回车键继续..." dummy
    done
}

# 运行主菜单
main
