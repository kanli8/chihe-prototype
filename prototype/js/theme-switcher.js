/**
 * 齿合平台 - 主题切换器
 */

class ThemeSwitcher {
    constructor() {
        this.currentTheme = localStorage.getItem('chihe-theme') || 'blue';
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.applyTheme(this.currentTheme);
    }

    render() {
        const html = `
            <div class="theme-switcher">
                <button class="theme-toggle-btn" onclick="themeSwitcher.toggle()">
                    🎨
                </button>
                <div class="theme-panel" id="themePanel">
                    <h4>选择主题风格</h4>
                    <div class="theme-grid">
                        <div class="theme-option theme-blue" data-theme="blue" onclick="themeSwitcher.setTheme('blue')">
                            <div class="theme-color"></div>
                            <span>默认蓝</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-green" data-theme="green" onclick="themeSwitcher.setTheme('green')">
                            <div class="theme-color"></div>
                            <span>清新绿</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-orange" data-theme="orange" onclick="themeSwitcher.setTheme('orange')">
                            <div class="theme-color"></div>
                            <span>活力橙</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-purple" data-theme="purple" onclick="themeSwitcher.setTheme('purple')">
                            <div class="theme-color"></div>
                            <span>紫色优雅</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-minimal" data-theme="minimal" onclick="themeSwitcher.setTheme('minimal')">
                            <div class="theme-color"></div>
                            <span>极简白</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-dark" data-theme="dark" onclick="themeSwitcher.setTheme('dark')">
                            <div class="theme-color"></div>
                            <span>深色科技</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-pink" data-theme="pink" onclick="themeSwitcher.setTheme('pink')">
                            <div class="theme-color"></div>
                            <span>粉色温馨</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-gold" data-theme="gold" onclick="themeSwitcher.setTheme('gold')">
                            <div class="theme-color"></div>
                            <span>金色轻奢</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-cyan" data-theme="cyan" onclick="themeSwitcher.setTheme('cyan')">
                            <div class="theme-color"></div>
                            <span>青蓝专业</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-dark-green" data-theme="dark-green" onclick="themeSwitcher.setTheme('dark-green')">
                            <div class="theme-color"></div>
                            <span>暗黑护眼</span>
                            <div class="theme-dot"></div>
                        </div>
                        <div class="theme-option theme-warm" data-theme="warm" onclick="themeSwitcher.setTheme('warm')">
                            <div class="theme-color"></div>
                            <span>暖棕复古</span>
                            <div class="theme-dot"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    bindEvents() {
        // 点击其他地方关闭面板
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-switcher')) {
                document.getElementById('themePanel').classList.remove('show');
            }
        });
    }

    toggle() {
        const panel = document.getElementById('themePanel');
        panel.classList.toggle('show');
    }

    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        localStorage.setItem('chihe-theme', theme);

        // 更新UI
        document.querySelectorAll('.theme-option').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`.theme-option[data-theme="${theme}"]`).classList.add('active');

        // 关闭面板
        document.getElementById('themePanel').classList.remove('show');
    }

    applyTheme(theme) {
        const html = document.documentElement;
        if (theme === 'blue') {
            html.removeAttribute('data-theme');
        } else {
            html.setAttribute('data-theme', theme);
        }
    }
}

// 创建全局实例
let themeSwitcher;
document.addEventListener('DOMContentLoaded', () => {
    themeSwitcher = new ThemeSwitcher();
});
