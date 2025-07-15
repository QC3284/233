// 创建并立即执行
(function() {
    // 动态配置对象
    const live2dConfig = {
        path: {
            homePath: '/',
            modelPath: 'https://cdn3.xcqcoo.top/jsd/gh/QC3284/hugo-static-resource@latest/live2d/live2d-moc3/',
            cssPath: 'https://cdn3.xcqcoo.top/jsd/gh/letere-gzj/live2d-widget-v3@latest/waifu.css',
            tipsJsonPath: 'https://cdn3.xcqcoo.top/jsd/gh/QC3284/live2d-widget-v3@latest/waifu-tips.json',
            tipsJsPath: 'https://cdn3.xcqcoo.top/jsd/gh/letere-gzj/live2d-widget-v3@latest/waifu-tips.js',
            live2dCorePath: 'https://cdn3.xcqcoo.top/jsd/gh/letere-gzj/live2d-widget-v3@latest/Core/live2dcubismcore.js',
            live2dSdkPath: 'https://cdn3.xcqcoo.top/jsd/gh/letere-gzj/live2d-widget-v3@latest/live2d-sdk.js'
        },
        tools: ["hitokoto", "asteroids", "express", "switch-model", "switch-texture", "photo", "info", "quit"],
        drag: { enable: true, direction: ["x", "y"] },
        switchType: "order"
    };

    // 资源加载器
    const resourceLoader = (url, type) => {
        return new Promise((resolve, reject) => {
            const element = type === 'css' 
                ? Object.assign(document.createElement('link'), { rel: 'stylesheet', href: url })
                : Object.assign(document.createElement('script'), { src: url });

            element.onload = () => resolve(`Loaded ${url}`);
            element.onerror = () => reject(`Failed to load ${url}`);
            document.head.append(element);
        });
    };

    // 响应式检测
    const initLive2D = () => {
        if (window.innerWidth < 768) return;

        // 如果已经存在看板娘，先移除
        const existingWaifu = document.querySelector('#waifu');
        if (existingWaifu) existingWaifu.remove();
        
        // 移除旧的样式
        const oldStyle = document.querySelector('#live2d-style');
        if (oldStyle) oldStyle.remove();

        Promise.all([
            resourceLoader(live2dConfig.path.cssPath, 'css'),
            resourceLoader(live2dConfig.path.live2dCorePath, 'js'),
            resourceLoader(live2dConfig.path.live2dSdkPath, 'js'),
            resourceLoader(live2dConfig.path.tipsJsPath, 'js')
        ]).then(() => {
            // 添加z-index样式确保显示在最前面
            const style = document.createElement('style');
            style.id = 'live2d-style';
            style.innerHTML = `
                #waifu {
                    z-index: 10000 !important;
                }
            `;
            document.head.appendChild(style);
            
            // 初始化函数来自 waifu-tips.js
            if (typeof initWidget === 'function') {
                initWidget({
                    homePath: live2dConfig.path.homePath,
                    waifuPath: live2dConfig.path.tipsJsonPath,
                    cdnPath: live2dConfig.path.modelPath,
                    tools: live2dConfig.tools,
                    dragEnable: live2dConfig.drag.enable,
                    dragDirection: live2dConfig.drag.direction,
                    switchType: live2dConfig.switchType
                });
            }
        }).catch(console.error);
    };

    // 延迟加载防止阻塞
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(initLive2D, 300);
    });

    // 窗口大小变化监听
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && !document.querySelector('#waifu')) {
            initLive2D();
        }
    });

    // 监听页面变化事件（针对单页应用）
    let lastPath = window.location.pathname;
    
    // 监听路由变化（适用于单页应用）
    const observeUrlChange = () => {
        const observer = new MutationObserver(() => {
            if (window.location.pathname !== lastPath) {
                lastPath = window.location.pathname;
                initLive2D();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };
    
    // 监听 history API 变化
    const wrapHistoryMethod = (method) => {
        const orig = history[method];
        return function() {
            const result = orig.apply(this, arguments);
            const event = new Event(method.toLowerCase());
            event.arguments = arguments;
            window.dispatchEvent(event);
            return result;
        };
    };
    
    history.pushState = wrapHistoryMethod('pushState');
    history.replaceState = wrapHistoryMethod('replaceState');
    
    window.addEventListener('pushstate', () => initLive2D());
    window.addEventListener('replacestate', () => initLive2D());
    window.addEventListener('popstate', () => initLive2D());
    
    // 开始监听URL变化
    observeUrlChange();
})();
